// food-recognition.js
// 调用 CloudBase 云函数识别食物（百度AI菜品识别 API）
// 替代之前一直失败的 V2-V10 自训练方案

const FoodRecognition = {
  // v1.9：APK 本地离线包无云端代理，直接降级为手动录入
  _isLocalPkg: function () {
    return typeof location !== 'undefined' &&
      (location.protocol === 'file:' || location.protocol === 'content:');
  },

  // 拍照并识别
  async recognizeFromCamera() {
    if (this._isLocalPkg()) {
      if (window.App && window.App.toast) {
        window.App.toast('离线包暂不支持拍照识别，请手动录入或搜索菜谱');
      }
      return null;
    }
    try {
      // 1. 拍照
      const imageBase64 = await this.capturePhoto();
      if (!imageBase64) return null;

      // 2. 调用云函数识别
      const result = await this.callRecognizeAPI(imageBase64);
      return result;
    } catch (e) {
      console.error('食物识别失败:', e);
      return null;
    }
  },

  // 从相册选择并识别
  async recognizeFromGallery() {
    if (this._isLocalPkg()) {
      if (window.App && window.App.toast) {
        window.App.toast('离线包暂不支持拍照识别，请手动录入或搜索菜谱');
      }
      return null;
    }
    try {
      const imageBase64 = await this.pickFromGallery();
      if (!imageBase64) return null;

      const result = await this.callRecognizeAPI(imageBase64);
      return result;
    } catch (e) {
      console.error('食物识别失败:', e);
      return null;
    }
  },

  // 调用 CloudBase 云函数
  async callRecognizeAPI(imageBase64) {
    const app = tcb.init({
      env: window.ENV_ID || 'ketoapp20206-d2gxkja9h6324aa47'
    });

    // 去掉 base64 头部 "data:image/jpeg;base64,"
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const result = await app.callFunction({
      name: 'foodRecognize',
      data: {
        image: base64Data,
        top_num: 5  // 返回 top5 结果
      }
    });

    if (result.result && result.result.success) {
      return result.result.data;
    } else {
      throw new Error(result.result?.error || '识别失败');
    }
  },

  // 拍照
  async capturePhoto() {
    return new Promise((resolve, reject) => {
      // 在 Android WebView 中通过 JSBridge 调用原生相机
      if (window.Android && window.Android.takePhoto) {
        window.Android.takePhoto((base64) => {
          resolve('data:image/jpeg;base64,' + base64);
        });
        return;
      }

      // 浏览器/H5 环境：使用 input file
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';

      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      };

      input.click();
    });
  },

  // 从相册选择
  async pickFromGallery() {
    return new Promise((resolve, reject) => {
      if (window.Android && window.Android.pickFromGallery) {
        window.Android.pickFromGallery((base64) => {
          resolve('data:image/jpeg;base64,' + base64);
        });
        return;
      }

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      };

      input.click();
    });
  },

  // 显示识别结果
  showResult(data) {
    if (!data || !data.result || data.result.length === 0) {
      return '未能识别出食物，请换个角度或光线再试';
    }

    const items = data.result.slice(0, 3);
    let html = '<div class="food-recognition-result">';
    html += '<h3>识别结果</h3>';

    items.forEach((item, i) => {
      const name = item.name || '未知';
      const prob = (item.probability * 100).toFixed(1);
      html += `
        <div class="recognition-item" data-name="${name}">
          <span class="rank">${i + 1}</span>
          <span class="name">${name}</span>
          <span class="prob">${prob}%</span>
        </div>
      `;
    });

    html += '</div>';
    return html;
  },

  // 营养信息查询（可选 - 用第二个 API 查热量）
  async getNutrition(foodName) {
    const app = tcb.init({ env: window.ENV_ID });
    const result = await app.callFunction({
      name: 'getNutrition',
      data: { food: foodName }
    });
    return result.result?.data || null;
  }
};

// 暴露到全局
window.FoodRecognition = FoodRecognition;
