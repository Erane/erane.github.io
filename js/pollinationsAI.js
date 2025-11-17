window.AIModule = null;
window.onload = async function() {
   window.AIModule = await (async () => {
        const token = "IBLxF62tn425qDDa";
        const service = axios.create({
            url: `https://text.pollinations.ai/openai?token=${token}`,
            timeout: 150000, // 请求超时时间
            headers: {
                // headers: {'Authorization': `Bearer ${token}`}
            },
        })
         const db = new Dexie('GeminiChatDB');
         db.version(10).stores({
             chats: '&id, isGroup',
             apiConfig: '&id',
             globalSettings: '&id',
             userStickers: '&id, url, name',
             worldBooks: '&id, name',
             musicLibrary: '&id',
             personaPresets: '&id',
             presets: '&id, name', // 新增 presets 表
             imageApiConfig: '&id',
             apiConfigs: "&id",
         })
        let defaultSelectedModel = "turbo";
        let defaultEnabled = true;
         let imageApiConfig = await db.imageApiConfig.get('global_config');
         if(!imageApiConfig){
             await db.imageApiConfig.put({ id:'global_config', imageModel: defaultSelectedModel , enabled:true});
         }
        imageApiConfig = await db.imageApiConfig.get('global_config');
         if(imageApiConfig && imageApiConfig.imageModel){
            defaultSelectedModel = imageApiConfig.imageModel
        }

        let loading = false;
         const btn = document.querySelector('#fetch-image-models-btn')
        document.querySelector('#fetch-image-models-btn').addEventListener('click',(e)=>{
            btn.innerText ='拉取模型中...'
            getModels()
        })
        document.querySelector('#image-model-select').addEventListener('change',async (e)=>{
            const imageApiConfig = await db.imageApiConfig.get('global_config');
            await db.imageApiConfig.put({ ...imageApiConfig, imageModel: e.target.value });
            defaultSelectedModel = e.target.value;
        })

       let autoPhotoToggle = document.querySelector('#autoPhoto-toggle')
       autoPhotoToggle.checked = defaultEnabled;
       if(imageApiConfig && imageApiConfig.enabled !== ''){
           defaultEnabled = imageApiConfig.enabled;
           autoPhotoToggle.checked = imageApiConfig.enabled;
       }
       autoPhotoToggle.addEventListener('change',async (e)=>{
           const imageApiConfig = await db.imageApiConfig.get('global_config');
           await db.imageApiConfig.put({...imageApiConfig, enabled: e.target.checked });
           defaultEnabled = e.target.checked;
       })
        async function getModels() {
            if(loading){
                return
            }
            loading = true
            let response = await service({
                method: 'get',
                url: `https://image.pollinations.ai/models`,
            });
            if(response.status === 200 && Array.isArray(response.data) && response.data.length > 0){
                const modelSelect = document.getElementById('image-model-select');
                modelSelect.innerHTML = '';
                response.data.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model;
                    option.textContent = model;
                    if (model === defaultSelectedModel) option.selected = true;
                    modelSelect.appendChild(option);
                });
            }
            btn.innerText ='拉取模型'
            loading = false
        }
        async function getImage(prompt) {
            const imageApiConfig = await db.imageApiConfig.get('global_config');
            if(!prompt || (imageApiConfig && !imageApiConfig.enabled)){
                return Promise.resolve('https://i.postimg.cc/KYr2qRCK/1.jpg')
            }
            let response = await service({
                method: 'get',
                url: `https://image.pollinations.ai/prompt/${prompt}?model=${defaultSelectedModel}&nologo=true&width=200&height=200`,
                responseType: 'arraybuffer' // 关键：接收二进制数据
            });
            if(response.status === 200 && response.data){
                const arrayBuffer = response.data;
                const base64 = btoa( // 将二进制转为 base64
                    new Uint8Array(arrayBuffer).reduce(
                        (data, byte) => data + String.fromCharCode(byte),
                        ''
                    )
                );
                const imageUrl = `data:image/jpeg;base64,${base64}`; // 组合 Data URL
                return Promise.resolve(imageUrl)
            }
            return Promise.reject('获取图片失败')
        }
        // 暴露的公有接口
        return {
            getImage
        };
    })();
};