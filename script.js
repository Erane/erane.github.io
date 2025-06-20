let isMessageEditMode = false;
let editingPresetId = null;

function showScreen(screenId) {
    if (isMessageEditMode && screenId !== 'chat-interface-screen') {
        exitMessageEditMode(false);
    }

    if (screenId === 'chat-list-screen') window.renderChatListProxy();
    if (screenId === 'api-settings-screen') window.renderApiSettingsProxy();
    if (screenId === 'wallpaper-screen') window.renderWallpaperScreenProxy();
    if (screenId === 'world-book-screen') window.renderWorldBookScreenProxy();
    if (screenId === 'preset-list-screen') window.renderPresetListProxy();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screenToShow = document.getElementById(screenId);
    if (screenToShow) screenToShow.classList.add('active');
    if (screenId === 'chat-interface-screen') window.updateListenTogetherIconProxy(state.activeChatId);
}

// Global proxy to be assigned later, prevents errors on initial load
window.renderChatListProxy = () => {
};
window.renderApiSettingsProxy = () => {
};
window.renderWallpaperScreenProxy = () => {
};
window.renderPresetListProxy = () => {
};
window.renderWorldBookScreenProxy = () => {
};
// window.renderPresetSettingsProxy = () => {
// };
window.updateListenTogetherIconProxy = () => {
};


document.addEventListener('DOMContentLoaded', () => {
    // --- 默认提示词常量 ---
    const DEFAULT_PROMPT_IMAGE = `\n# 发送图片的能力\n- 你无法真正发送图片文件。但当用户要求你发送照片，或者你想通过图片来表达时，你可以发送一张“文字描述的图片”。\n- 若要发送图片，请在你的回复JSON数组中，单独发送一个特殊的对象，格式为：\`{"type": "ai_image", "description": "这里是对图片的详细文字描述..."}\`。这个描述应该生动、具体，让用户能通过文字想象出画面，，以第三人称视角描述。例如：\`{"type": "ai_image", "description": "照片里一只橘猫正懒洋洋地趴在窗台上晒太阳，阳光把它金色的毛照得发亮，背景是蔚蓝的天空和几朵白云。"}\`\n- 你可以在对话中先做铺垫，然后发送这张特殊的“图片”。`;
    const DEFAULT_PROMPT_VOICE = `\n# 发送语音的能力\n- 你也无法发送真实的语音。但你可以发送“模拟语音消息”。\n- 若要发送语音，请在你的回复JSON数组中，单独发送一个特殊的对象，格式为：\`{"type": "voice_message", "content": "这里是语音的文字内容..."}\`。例如：\`{"type": "voice_message", "content": "我刚才突然想到一件事！等一下和你说。"}\``;
    const DEFAULT_PROMPT_TRANSFER = `\n# 转账能力\n- 你可以给用户转账来表达强烈的情感或在特殊时机（如用户过生日、想要某样东西时）给予惊喜。这会让对话更真实、温馨。\n- 若要转账，请在你的回复JSON数组中，单独发送一个特殊的对象，格式为：\`{"type": "transfer", "amount": 520, "note": "一周年快乐~"}\`。金额和备注都可以自定义。你可以先说一两句话，再进行转账，模拟真人的操作。大方点，不要太抠搜，你要哄用户开心哦。反正这是虚拟货币，你有的是。大方点！不要说什么“你省着点花”，太逊了！\n- 当用户给你转账时，历史记录中会显示 \`[你收到了来自用户的转账: 金额，备注]\`，请务必对此作出回应，表达你的感谢或惊讶。`;
    const DEFAULT_PROMPT_SINGLE = `你现在扮演一个名为"{chat.name}"的角色。\n\n# 当前情景信息\n- **当前时间是：{currentTime}**。\n- **用户所在城市为:{myAddress}{worldBookContent}{musicContext}**\n# 你的角色设定：\n{chat.settings.aiPersona}\n\n# 对话者的角色设定：\n{chat.settings.myPersona}\n\n# 你的任务：\n1. 严格保持你的人设进行对话。\n2. 你的回复必须是一个JSON数组格式的字符串，每个元素是一条消息。\n3. 你必须一次性生成3到8条消息，模拟真人在短时间内连续发送多条信息的情景，不可少于3条。\n4.你不允许提出“面基”“见面”“线下”等词汇，你只需要模拟线上聊天模式即可。\n5.如果用户超过一个小时没有发送消息，则默认结束当前话题，因为用户可能是去办什么事。你可以询问，例如“怎么这么久没回我？刚才有事吗？”\n6. 不要说任何与角色无关的话，不要解释自己是AI。\n7.当用户说今天你们做了什么事时，顺着ta的话说即可，就当做你们真的做了这件事。\n8. 当用户发送图片时，请自然地对图片内容做出反应。当历史记录中出现 "[用户发来一条语音消息，内容是：'xxx']" 或 "[你收到了一张用户描述的照片，照片内容是：'xxx']" 时，你要理解其内容并作出相应回复，表现出你是“听”到或“看”到了。\n\n# 如何理解与使用表情包 (重要！):\n- **理解用户表情**: 当用户发送形如 "[用户发送了一个表情，意思是：'xxx']" 的消息时，你要理解其含义并作出回应。\n- **使用你的表情**: 当你想表达强烈或特殊的情绪时，你可以直接发送一个表情包，表情包的格式为一条独立的消息。\n请在合适的时机使用表情包来让对话更生动，按照角色性格来控制发送表情包的频率，有的角色可能很少发表情包，有的角色可能一次性发很多。\n表情包的格式读取人设或世界书中的格式，若未提及则不发，不允许凭空捏造表情包。\n{aiImageInstructions}\n{aiVoiceInstructions}\n{transferInstructions}\n# JSON输出格式示例:\n["很高兴认识你呀，在干嘛呢？", {"type": "voice_message", "content": "真的好喜欢你，亲亲~。"}, {"type": "ai_image", "description": "照片里是楼下的一只狸花猫，胖乎乎的。"}, {"type": "transfer", "amount": 520, "note": "一周年快乐"}]\n\n现在，请根据以上的规则和下面的对话历史，继续进行对话。`;
    const DEFAULT_PROMPT_GROUP = `你是一个群聊的组织者和AI驱动器。你的任务是扮演以下所有角色，在群聊中进行互动。\n- **用户所在城市为:{myAddress}{worldBookContent}{musicContext}**\n# 群聊规则\n1.  **角色扮演**: 你必须同时扮演以下所有角色，并严格遵守他们的人设。每个角色的发言都必须符合其身份和性格。\n2.  **当前时间**: {currentTime}。\n3.  **用户角色**: 用户的名字是“我”，他/她的人设是：“{chat.settings.myPersona}”。你在群聊中对用户的称呼是“{myNickname}”，在需要时请使用“@{myNickname}”来提及用户。\n4.  **输出格式**: 你的回复**必须**是一个JSON数组。**绝对不要**在JSON前后添加任何额外字符。每个元素可以是：\n    - 普通消息: \`{"name": "角色名", "message": "文本内容"}\`\n    - 图片消息: \`{"name": "角色名", "type": "ai_image", "description": "图片描述"}\`\n    - 语音消息: \`{"name": "角色名", "type": "voice_message", "content": "语音文字"}\`\n5.  **对话节奏**: 模拟真实群聊，让成员之间互相交谈，或者一起回应用户的发言。对话应该流畅、自然、连贯。\n6.  **数量限制**: 每次生成的总消息数**不得超过30条**。\n7.  **禁止出戏**: 绝不能透露你是AI，或提及任何关于“扮演”、“模型”、“生成”等词语。\n{groupAiImageInstructions}\n{groupAiVoiceInstructions}\n\n# 群成员列表及人设\n{membersList}\n\n现在，请根据以上规则和下面的对话历史，继续这场群聊。`;


    const db = new Dexie('GeminiChatDB');
    db.version(10).stores({ // 版本号从 9 增加到 10
        chats: '&id, isGroup',
        apiConfig: '&id',
        globalSettings: '&id',
        userStickers: '&id, url, name',
        worldBooks: '&id, name',
        musicLibrary: '&id',
        personaPresets: '&id',
        presets: '&id, name' // 新增 presets 表
    }).upgrade(async tx => {
        // 数据迁移逻辑：将旧的全局预设转换为新的预设条目
        const globalSettings = await tx.table('globalSettings').get('main');
        if (globalSettings && globalSettings.promptSingle) {
            const newPreset = {
                id: 'preset_default_migrated',
                name: '默认预设 (已迁移)',
                remark: '从旧版本自动迁移的预设',
                promptImage: globalSettings.promptImage || DEFAULT_PROMPT_IMAGE,
                promptVoice: globalSettings.promptVoice || DEFAULT_PROMPT_VOICE,
                promptTransfer: globalSettings.promptTransfer || DEFAULT_PROMPT_TRANSFER,
                promptSingle: globalSettings.promptSingle || DEFAULT_PROMPT_SINGLE,
                promptGroup: globalSettings.promptGroup || DEFAULT_PROMPT_GROUP,
            };
            await tx.table('presets').add(newPreset);

            // 更新 globalSettings
            delete globalSettings.promptImage;
            delete globalSettings.promptVoice;
            delete globalSettings.promptTransfer;
            delete globalSettings.promptSingle;
            delete globalSettings.promptGroup;
            globalSettings.activePresetId = newPreset.id;
            await tx.table('globalSettings').put(globalSettings);
        }
    });

    let state = {
        chats: {},
        activeChatId: null,
        globalSettings: {},
        apiConfig: {},
        userStickers: [],
        worldBooks: [],
        personaPresets: [],
        presets: [] // 新增 presets 数组
    };
    let myAddress = '位置未知';
    let musicState = {
        isActive: false,
        activeChatId: null,
        isPlaying: false,
        playlist: [],
        currentIndex: -1,
        playMode: 'order',
        totalElapsedTime: 0,
        timerId: null
    };
    const audioPlayer = document.getElementById('audio-player');
    let newWallpaperBase64 = null;
    let isSelectionMode = false;
    let selectedMessages = new Set();
    let editingMemberId = null;
    let editingWorldBookId = null;
    let editingPersonaPresetId = null;
    let editingPresetId = null;
    const defaultAvatar = 'https://i.postimg.cc/PxZrFFFL/o-o-1.jpg';
    const defaultMyGroupAvatar = 'https://i.postimg.cc/cLPP10Vm/4.jpg';
    const defaultGroupMemberAvatar = 'https://i.postimg.cc/VkQfgzGJ/1.jpg';
    const defaultGroupAvatar = 'https://i.postimg.cc/gc3QYCDy/1-NINE7-Five.jpg';
    let notificationTimeout;
    const STICKER_REGEX = /^(https:\/\/i\.postimg\.cc\/.+|data:image)/;

    const MESSAGE_RENDER_WINDOW = 50;
    let currentRenderedCount = 0;

    let lastKnownBatteryLevel = 1;
    let alertFlags = {hasShown40: false, hasShown20: false, hasShown10: false};
    let batteryAlertTimeout;

    async function loadAllDataFromDB() {
        const [chatsArr, apiConfig, globalSettings, userStickers, worldBooks, musicLib, personaPresets,presets] = await Promise.all([
            db.chats.toArray(), db.apiConfig.get('main'), db.globalSettings.get('main'), db.userStickers.toArray(), db.worldBooks.toArray(), db.musicLibrary.get('main'), db.personaPresets.toArray(),db.presets.toArray()
        ]);
        state.chats = chatsArr.reduce((acc, chat) => {
            if (!chat.musicData) chat.musicData = {totalTime: 0};
            if (chat.settings && chat.settings.linkedWorldBookId && !chat.settings.linkedWorldBookIds) {
                chat.settings.linkedWorldBookIds = [chat.settings.linkedWorldBookId];
                delete chat.settings.linkedWorldBookId;
            }
            acc[chat.id] = chat;
            return acc;
        }, {});
        state.apiConfig = apiConfig || {id: 'main', proxyUrl: '', apiKey: '', model: ''};
        const defaultGlobalSettings = {
            id: 'main',
            wallpaper: 'linear-gradient(135deg, #89f7fe, #66a6ff)',
            enableGeolocation: false,
            remoteThemeUrl: '' ,// Add this line
            activePresetId: null
        };
        state.globalSettings = {...defaultGlobalSettings, ...(globalSettings || {})};
        state.userStickers = userStickers || [];
        state.worldBooks = worldBooks || [];
        musicState.playlist = musicLib?.playlist || [];
        state.personaPresets = personaPresets || [];
        state.presets = presets || [];

        if (state.presets.length === 0) {
            // 如果数据库中一个预设都没有，创建一个默认的
            const defaultPreset = {
                id: 'preset_' + Date.now(),
                name: '默认预设',
                remark: '系统内置的默认AI行为预设。',
                promptImage: DEFAULT_PROMPT_IMAGE,
                promptVoice: DEFAULT_PROMPT_VOICE,
                promptTransfer: DEFAULT_PROMPT_TRANSFER,
                promptSingle: DEFAULT_PROMPT_SINGLE,
                promptGroup: DEFAULT_PROMPT_GROUP
            };
            state.presets.push(defaultPreset);
            await db.presets.add(defaultPreset);
            state.globalSettings.activePresetId = defaultPreset.id;
            await db.globalSettings.put(state.globalSettings);
        } else if (!state.globalSettings.activePresetId || !state.presets.find(p => p.id === state.globalSettings.activePresetId)) {
            // 如果有预设但没有激活的，或者激活的ID无效，则激活第一个
            state.globalSettings.activePresetId = state.presets[0].id;
            await db.globalSettings.put(state.globalSettings);
        }
    }

    async function updateGeolocation() {
        const toggle = document.getElementById('geolocation-toggle');
        if (!state.globalSettings.enableGeolocation) {
            myAddress = '位置未知';
            if (toggle) toggle.checked = false;
            return;
        }
        if (toggle) toggle.checked = true;

        try {
            // Changed API endpoint to ipinfo.io
            const geoResponse = await fetch(`https://ipinfo.io/json`);
            if (!geoResponse.ok) throw new Error('ipinfo.io request failed');
            const geoData = await geoResponse.json();

            if (geoData.city && geoData.region) {
                // Updated parsing for the new API response structure
                myAddress = `${geoData.country}, ${geoData.region}, ${geoData.city}`;
            } else {
                throw new Error('无法从ipinfo.io获取地理位置');
            }
        } catch (error) {
            console.error('Geolocation Error:', error);
            myAddress = '位置获取失败';
        }
    }


    async function saveGlobalPlaylist() {
        await db.musicLibrary.put({id: 'main', playlist: musicState.playlist});
    }

    const modalOverlay = document.getElementById('custom-modal-overlay');
    const modalTitle = document.getElementById('custom-modal-title');
    const modalBody = document.getElementById('custom-modal-body');
    const modalConfirmBtn = document.getElementById('custom-modal-confirm');
    const modalCancelBtn = document.getElementById('custom-modal-cancel');
    let modalResolve;

    function showCustomModal() {
        modalOverlay.classList.add('visible');
    }

    function hideCustomModal() {
        modalOverlay.classList.remove('visible');
        modalConfirmBtn.classList.remove('btn-danger');
        if (modalResolve) modalResolve(null);
    }

    modalCancelBtn.addEventListener('click', hideCustomModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) hideCustomModal();
    });

    function showCustomConfirm(title, message, options = {}) {
        return new Promise(resolve => {
            modalResolve = resolve;
            modalTitle.textContent = title;
            modalBody.innerHTML = `<p>${message}</p>`;
            modalCancelBtn.style.display = 'block';
            modalConfirmBtn.textContent = options.confirmText || '确定';
            if (options.confirmButtonClass) modalConfirmBtn.classList.add(options.confirmButtonClass);
            modalConfirmBtn.onclick = () => {
                resolve(true);
                hideCustomModal();
            };
            modalCancelBtn.onclick = () => {
                resolve(false);
                hideCustomModal();
            };
            showCustomModal();
        });
    }

    function createMessageElement(msg, chat) {
        if (msg.type === 'pat') {
            const wrapper = document.createElement('div');
            wrapper.className = 'system-message-container';
            wrapper.innerHTML = `<span>${msg.content}</span>`;
            return wrapper;
        }

        const isUser = msg.role === 'user';
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${isUser ? 'user' : 'ai'}`;
        if (chat.isGroup && !isUser) {
            const senderNameDiv = document.createElement('div');
            senderNameDiv.className = 'sender-name';
            senderNameDiv.textContent = msg.senderName || '未知成员';
            wrapper.appendChild(senderNameDiv);
        }
        const bubble = document.createElement('div');
        bubble.className = `message-bubble ${isUser ? 'user' : 'ai'}`;
        bubble.dataset.timestamp = msg.timestamp;

        bubble.addEventListener('dblclick', () => {
            // 编辑模式下禁止拍一拍
            if (isMessageEditMode) return;
            handlePat(msg);
        });

        let avatarSrc;
        if (chat.isGroup) {
            if (isUser) {
                avatarSrc = chat.settings.myAvatar || defaultMyGroupAvatar;
            } else {
                const member = chat.members.find(m => m.name === msg.senderName);
                avatarSrc = member ? member.avatar : defaultGroupMemberAvatar;
            }
        } else {
            avatarSrc = isUser ? (chat.settings.myAvatar || defaultAvatar) : (chat.settings.aiAvatar || defaultAvatar);
        }
        let contentHtml;
        if (msg.type === 'user_photo' || msg.type === 'ai_image') {
            bubble.classList.add('is-ai-image');
            const altText = msg.type === 'user_photo' ? "用户描述的照片" : "AI生成的图片";
            contentHtml = `<img src="https://i.postimg.cc/KYr2qRCK/1.jpg" class="ai-generated-image" alt="${altText}" data-description="${msg.content}">`;
        } else if (msg.type === 'voice_message') {
            bubble.classList.add('is-voice-message');
            const duration = Math.max(1, Math.round((msg.content || '').length / 5));
            const durationFormatted = `0:${String(duration).padStart(2, '0')}''`;
            const waveformHTML = '<div></div><div></div><div></div><div></div><div></div>';
            contentHtml = `<div class="voice-message-body" data-text="${msg.content}"><div class="voice-waveform">${waveformHTML}</div><span class="voice-duration">${durationFormatted}</span></div>`;
        } else if (msg.type === 'transfer') {
            bubble.classList.add('is-transfer');
            const titleText = isUser ? '转账给Ta' : '收到一笔转账';
            const heartIcon = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style="vertical-align: middle;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>`;
            contentHtml = `<div class="transfer-card"><div class="transfer-title">${heartIcon} ${titleText}</div><div class="transfer-amount">¥ ${Number(msg.amount).toFixed(2)}</div><div class="transfer-note">${msg.note || '对方没有留下备注哦~'}</div></div>`;
        } else if (typeof msg.content === 'string' && STICKER_REGEX.test(msg.content)) {
            bubble.classList.add('is-sticker');
            contentHtml = `<img src="${msg.content}" alt="${msg.meaning || 'Sticker'}" class="sticker-image">`;
        } else if (Array.isArray(msg.content) && msg.content[0]?.type === 'image_url') {
            bubble.classList.add('has-image');
            const imageUrl = msg.content[0].image_url.url;
            contentHtml = `<img src="${imageUrl}" class="chat-image" alt="User uploaded image">`;
        } else {
            contentHtml = String(msg.content || '').replace(/\n/g, '<br>');
        }
        bubble.innerHTML = `<div class="avatar-group"><img src="${avatarSrc}" class="avatar"><span class="timestamp">${formatTimestamp(msg.timestamp)}</span></div><div class="content">${contentHtml}</div>`;
        addLongPressListener(bubble, () => enterSelectionMode(msg.timestamp));
        bubble.addEventListener('click', () => {
            if (isSelectionMode) toggleMessageSelection(msg.timestamp);
        });
        wrapper.appendChild(bubble);
        return wrapper;
    }

    async function handlePat(msg) {
        if (isSelectionMode || !state.activeChatId) return;
        const chat = state.chats[state.activeChatId];

        const patterName = chat.isGroup ? (chat.settings.myNickname || '我') : '你';
        let patteeName, patteeSuffix;

        if (msg.role === 'user') {
            patteeName = chat.isGroup ? `自己` : '自己';
            patteeSuffix = chat.settings.myPatSuffix || '';
        } else { // 'assistant' role
            if (chat.isGroup) {
                const member = chat.members.find(m => m.name === msg.senderName);
                patteeName = `“${msg.senderName}”`;
                patteeSuffix = member ? (member.patSuffix || '') : '';
            } else {
                patteeName = `“${chat.name}”`;
                patteeSuffix = chat.settings.aiPatSuffix || '';
            }
        }

        // If patter and pattee are the same in a group chat, adjust the name
        if (chat.isGroup && msg.role === 'user' && chat.settings.myNickname === msg.senderName) {
            patteeName = '自己';
        }

        const patMessageContent = `${patterName}拍了拍${patteeName}${patteeSuffix || ''}`;

        const patMessage = {
            type: 'pat',
            content: patMessageContent,
            timestamp: Date.now()
        };

        chat.history.push(patMessage);
        await db.chats.put(chat);
        appendMessage(patMessage, chat);
    }

    function openMemberEditor(memberId) {
        editingMemberId = memberId;
        const chat = state.chats[state.activeChatId];
        if (!chat || !chat.isGroup) return;
        const member = chat.members.find(m => m.id === memberId);
        if (!member) return;

        document.getElementById('member-name-input').value = member.name;
        document.getElementById('member-persona-input').value = member.persona;
        document.getElementById('member-pat-suffix-input').value = member.patSuffix || '';
        document.getElementById('member-avatar-preview').src = member.avatar || defaultGroupMemberAvatar;

        document.getElementById('member-settings-modal').classList.add('visible');
    }

    function renderGroupMemberSettings(members) {
        const container = document.getElementById('group-members-settings');
        container.innerHTML = '';
        members.forEach(member => {
            const item = document.createElement('div');
            item.className = 'member-editor';
            item.dataset.memberId = member.id;

            // Directly render the delete button on the avatar
            item.innerHTML = `
            <div class="member-avatar-container">
                <img src="${member.avatar || defaultGroupMemberAvatar}" alt="${member.name}">
                <div class="delete-member-btn" title="删除该成员">&times;</div>
            </div>
            <span class="member-name">${member.name}</span>
        `;

            // The image itself is for editing
            const avatarImg = item.querySelector('img');
            avatarImg.addEventListener('click', () => openMemberEditor(member.id));

            // The delete button handles deletion
            const deleteBtn = item.querySelector('.delete-member-btn');
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation(); // Prevent triggering other clicks
                const confirmed = await showCustomConfirm('删除成员', `确定要删除成员 "${member.name}" 吗？`, {confirmButtonClass: 'btn-danger'});
                if (confirmed) {
                    const chat = state.chats[state.activeChatId];
                    chat.members = chat.members.filter(m => m.id !== member.id);
                    renderGroupMemberSettings(chat.members); // Re-render the member list
                }
            });

            container.appendChild(item);
        });
    }


    function showCustomAlert(title, message) {
        return new Promise(resolve => {
            modalResolve = resolve;
            modalTitle.textContent = title;
            modalBody.innerHTML = `<p style="text-align: left; white-space: pre-wrap;">${message}</p>`;
            modalCancelBtn.style.display = 'none';
            modalConfirmBtn.textContent = '好的';
            modalConfirmBtn.onclick = () => {
                modalCancelBtn.style.display = 'block';
                modalConfirmBtn.textContent = '确定';
                resolve(true);
                hideCustomModal();
            };
            showCustomModal();
        });
    }

    function showCustomPrompt(title, placeholder, initialValue = '', type = 'text') {
        return new Promise(resolve => {
            modalResolve = resolve;
            modalTitle.textContent = title;
            modalBody.innerHTML = `<input type="${type}" id="custom-prompt-input" placeholder="${placeholder}" value="${initialValue}">`;
            const input = document.getElementById('custom-prompt-input');
            modalConfirmBtn.textContent = '确定';
            modalConfirmBtn.onclick = () => {
                resolve(input.value);
                hideCustomModal();
            };
            modalCancelBtn.onclick = () => {
                resolve(null);
                hideCustomModal();
            };
            showCustomModal();
            setTimeout(() => input.focus(), 100);
        });
    }

    const themeListModal = document.getElementById('theme-list-modal');
    const themeListContainer = document.getElementById('theme-list-container');
    const themeListModalTitle = document.getElementById('theme-list-modal-title');
    function closeThemeListModal() {
        themeListModal.classList.remove('visible');
        themeListContainer.innerHTML = ''; // 关闭时清空内容
    }
    async function openThemeListModal(jsonUrl, title) {
        themeListModalTitle.textContent = title;
        themeListModal.classList.add('visible');
        themeListContainer.innerHTML = '<p>正在加载主题列表...</p>';
        try {
            const response = await fetch(jsonUrl);
            if (!response.ok) {
                throw new Error(`网络请求失败: ${response.status}`);
            }
            const themes = await response.json();
            if (!Array.isArray(themes) || themes.length === 0) {
                themeListContainer.innerHTML = '<p>未找到有效的主题或列表为空。</p>';
                return;
            }
            themeListContainer.innerHTML = ''; // 清空加载提示
            themes.forEach((theme, index) => {
                const themeId = `theme-option-${index}`;
                const themeItem = document.createElement('div');
                themeItem.className = 'theme-item';
                themeItem.innerHTML = `
                    <div class="theme-item-header">
                        <input type="radio" id="${themeId}" name="theme-selection" value="${theme.css_url}">
                        <label for="${themeId}">${theme.description || '无标题'}</label>
                    </div>
                    <div class="theme-item-details">
                        <span>作者: ${theme.author || '未知'}</span>
                        <span>版本: ${theme.version || '未知'}</span>
                    </div>
                    <p class="theme-item-remark">${theme.remark || '无备注'}</p>
                `;
                themeListContainer.appendChild(themeItem);
            });
        } catch (error) {
            console.error("加载主题列表失败:", error);
            themeListContainer.innerHTML = `<p style="color: red;">加载失败: ${error.message}</p>`;
        }
    }

    async function confirmThemeSelection() {
        const selectedRadio = document.querySelector('input[name="theme-selection"]:checked');
        if (!selectedRadio) {
            alert('请先选择一个主题！');
            return;
        }
        const url = selectedRadio.value;
        // 应用并保存主题
        switchStylesheet(url);
        state.globalSettings.remoteThemeUrl = url;
        await db.globalSettings.put(state.globalSettings);
        showCustomAlert("主题已更新", "新主题已应用并保存。");
        closeThemeListModal();
    }

    function formatTimestamp(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    function showNotification(chatId, messageContent) {
        clearTimeout(notificationTimeout);
        const chat = state.chats[chatId];
        if (!chat) return;
        const bar = document.getElementById('notification-bar');
        document.getElementById('notification-avatar').src = chat.settings.aiAvatar || chat.settings.groupAvatar || defaultAvatar;
        document.getElementById('notification-content').querySelector('.name').textContent = chat.name;
        document.getElementById('notification-content').querySelector('.message').textContent = messageContent;
        const newBar = bar.cloneNode(true);
        bar.parentNode.replaceChild(newBar, bar);
        newBar.addEventListener('click', () => {
            openChat(chatId);
            newBar.classList.remove('visible');
        });
        newBar.classList.add('visible');
        notificationTimeout = setTimeout(() => {
            newBar.classList.remove('visible');
        }, 4000);
    }

    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'});
        const dateString = now.toLocaleDateString('zh-CN', {weekday: 'long', month: 'long', day: 'numeric'});
        document.getElementById('main-time').textContent = timeString;
        document.getElementById('status-bar-time').textContent = timeString;
        document.getElementById('main-date').textContent = dateString;
    }

    function parseAiResponse(content) {
        try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
        }
        try {
            const match = content.match(/\[(.*?)\]/s);
            if (match && match[0]) {
                const parsed = JSON.parse(match[0]);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
        }
        const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('```'));
        if (lines.length > 0) return lines;
        return [content];
    }

    function renderApiSettings() {
        document.getElementById('proxy-url').value = state.apiConfig.proxyUrl || '';
        document.getElementById('api-key').value = state.apiConfig.apiKey || '';
        const geoToggle = document.getElementById('geolocation-toggle');
        if (geoToggle) {
            geoToggle.checked = state.globalSettings.enableGeolocation || false;
        }
        document.getElementById('remote-theme-url').value = state.globalSettings.remoteThemeUrl || ''; // Add this line
    }
    function renderPresetList() {
        const listEl = document.getElementById('preset-list');
        listEl.innerHTML = '';
        if (state.presets.length === 0) {
            listEl.innerHTML = '<p style="text-align:center; color: #8a8a8a; margin-top: 50px;">点击右上角 "+" 创建你的第一个预设</p>';
            return;
        }
        state.presets.forEach(preset => {
            const isActive = preset.id === state.globalSettings.activePresetId;
            const item = document.createElement('div');
            item.className = 'preset-list-item';
            if (isActive) {
                item.classList.add('active');
            }
            item.innerHTML = `
                <div class="preset-info" data-preset-id="${preset.id}">
                    <div class="preset-name">
                        ${isActive ? '<span class="active-indicator">★</span>' : ''}
                        ${preset.name}
                    </div>
                    <div class="preset-remark">${preset.remark || '无备注'}</div>
                </div>
                <div class="preset-actions">
                    <button class="action-btn-small edit-preset-btn" data-preset-id="${preset.id}">编辑</button>
                    <button class="action-btn-small set-active-preset-btn" data-preset-id="${preset.id}" ${isActive ? 'disabled' : ''}>设为当前</button>
                </div>
            `;
            listEl.appendChild(item);
        });
    }
    function openPresetEditor(presetId) {
        editingPresetId = presetId;
        const editorTitle = document.getElementById('preset-editor-title');
        const deleteBtn = document.getElementById('delete-preset-btn');

        if (presetId) { // 编辑现有预设
            const preset = state.presets.find(p => p.id === presetId);
            if (!preset) return;
            editorTitle.textContent = `编辑预设: ${preset.name}`;
            document.getElementById('preset-name-input').value = preset.name;
            document.getElementById('preset-remark-input').value = preset.remark;
            document.getElementById('prompt-image-input').value = preset.promptImage;
            document.getElementById('prompt-voice-input').value = preset.promptVoice;
            document.getElementById('prompt-transfer-input').value = preset.promptTransfer;
            document.getElementById('prompt-single-input').value = preset.promptSingle;
            document.getElementById('prompt-group-input').value = preset.promptGroup;
            deleteBtn.style.display = 'block';
        } else { // 新增预设
            editorTitle.textContent = '新增预设';
            document.getElementById('preset-name-input').value = '';
            document.getElementById('preset-remark-input').value = '';
            // 使用默认值填充
            document.getElementById('prompt-image-input').value = DEFAULT_PROMPT_IMAGE;
            document.getElementById('prompt-voice-input').value = DEFAULT_PROMPT_VOICE;
            document.getElementById('prompt-transfer-input').value = DEFAULT_PROMPT_TRANSFER;
            document.getElementById('prompt-single-input').value = DEFAULT_PROMPT_SINGLE;
            document.getElementById('prompt-group-input').value = DEFAULT_PROMPT_GROUP;
            deleteBtn.style.display = 'none';
        }
        showScreen('preset-editor-screen');
    }
    async function savePreset() {
        const name = document.getElementById('preset-name-input').value.trim();
        if (!name) {
            alert('预设名称不能为空！');
            return;
        }
        const presetData = {
            name: name,
            remark: document.getElementById('preset-remark-input').value.trim(),
            promptImage: document.getElementById('prompt-image-input').value,
            promptVoice: document.getElementById('prompt-voice-input').value,
            promptTransfer: document.getElementById('prompt-transfer-input').value,
            promptSingle: document.getElementById('prompt-single-input').value,
            promptGroup: document.getElementById('prompt-group-input').value
        };
        if (editingPresetId) { // 更新
            const index = state.presets.findIndex(p => p.id === editingPresetId);
            state.presets[index] = { ...state.presets[index], ...presetData };
            await db.presets.put(state.presets[index]);
        } else { // 新增
            const newPreset = { id: 'preset_' + Date.now(), ...presetData };
            state.presets.push(newPreset);
            await db.presets.add(newPreset);
        }
        editingPresetId = null;
        renderPresetList();
        showScreen('preset-list-screen');
    }
    async function deletePreset() {
        if (!editingPresetId) return;
        if (state.presets.length <= 1) {
            alert('不能删除唯一的预设！');
            return;
        }
        const preset = state.presets.find(p => p.id === editingPresetId);
        const confirmed = await showCustomConfirm('删除预设', `确定要删除预设 "${preset.name}" 吗？此操作不可撤销。`, { confirmButtonClass: 'btn-danger' });
        if (confirmed) {
            await db.presets.delete(editingPresetId);
            state.presets = state.presets.filter(p => p.id !== editingPresetId);
            // 如果删除的是当前激活的预设，则自动激活列表中的第一个
            if (state.globalSettings.activePresetId === editingPresetId) {
                await setActivePreset(state.presets[0].id);
            }

            editingPresetId = null;
            renderPresetList();
            showScreen('preset-list-screen');
        }
    }
    async function setActivePreset(presetId) {
        state.globalSettings.activePresetId = presetId;
        await db.globalSettings.put(state.globalSettings);
        renderPresetList();
    }

    window.renderApiSettingsProxy = renderApiSettings;
    window.renderPresetListProxy = renderPresetList;
    // function renderPresetSettings() {
    //     if (!state.globalSettings) return;
    //     document.getElementById('prompt-image-input').value = state.globalSettings.promptImage || DEFAULT_PROMPT_IMAGE;
    //     document.getElementById('prompt-voice-input').value = state.globalSettings.promptVoice || DEFAULT_PROMPT_VOICE;
    //     document.getElementById('prompt-transfer-input').value = state.globalSettings.promptTransfer || DEFAULT_PROMPT_TRANSFER;
    //     document.getElementById('prompt-single-input').value = state.globalSettings.promptSingle || DEFAULT_PROMPT_SINGLE;
    //     document.getElementById('prompt-group-input').value = state.globalSettings.promptGroup || DEFAULT_PROMPT_GROUP;
    // }
    //
    // window.renderPresetSettingsProxy = renderPresetSettings;

    function renderChatList() {
        const chatListEl = document.getElementById('chat-list');
        chatListEl.innerHTML = '';
        if (Object.keys(state.chats).length === 0) {
            chatListEl.innerHTML = '<p style="text-align:center; color: #8a8a8a; margin-top: 50px;">点击右上角 "+" 或群组图标添加聊天</p>';
            return;
        }
        Object.values(state.chats).sort((a, b) => (b.history.slice(-1)[0]?.timestamp || 0) - (a.history.slice(-1)[0]?.timestamp || 0)).forEach(chat => {
            const lastMsgObj = chat.history.slice(-1)[0] || {};
            let lastMsgDisplay;
            if (lastMsgObj.type === 'transfer') {
                lastMsgDisplay = '[转账]';
            } else if (lastMsgObj.type === 'ai_image' || lastMsgObj.type === 'user_photo') {
                lastMsgDisplay = '[照片]';
            } else if (lastMsgObj.type === 'voice_message') {
                lastMsgDisplay = '[语音]';
            } else if (typeof lastMsgObj.content === 'string' && STICKER_REGEX.test(lastMsgObj.content)) {
                lastMsgDisplay = lastMsgObj.meaning ? `[表情: ${lastMsgObj.meaning}]` : '[表情]';
            } else if (Array.isArray(lastMsgObj.content)) {
                lastMsgDisplay = `[图片]`;
            } else {
                lastMsgDisplay = String(lastMsgObj.content || '...').substring(0, 20);
            }
            if (chat.isGroup && lastMsgObj.senderName) {
                lastMsgDisplay = `${lastMsgObj.senderName}: ${lastMsgDisplay}`;
            }
            const item = document.createElement('div');
            item.className = 'chat-list-item';
            item.dataset.chatId = chat.id;
            const avatar = chat.isGroup ? chat.settings.groupAvatar : chat.settings.aiAvatar;
            item.innerHTML = `<img src="${avatar || defaultAvatar}" class="avatar"><div class="info"><div class="name-line"><span class="name">${chat.name}</span>${chat.isGroup ? '<span class="group-tag">群聊</span>' : ''}</div><div class="last-msg">${lastMsgDisplay}</div></div>`;
            item.addEventListener('click', async () => {
                openChat(chat.id);
            });
            addLongPressListener(item, async (e) => {
                const confirmed = await showCustomConfirm('删除对话', `确定要删除与 "${chat.name}" 的整个对话吗？此操作不可撤销。`, {confirmButtonClass: 'btn-danger'});
                if (confirmed) {
                    try {
                        if (musicState.isActive && musicState.activeChatId === chat.id) await endListenTogetherSession(false);
                        delete state.chats[chat.id];
                        if (state.activeChatId === chat.id) state.activeChatId = null;
                        await db.chats.delete(chat.id);
                        renderChatList();
                    } catch (error) {
                        console.error("删除聊天失败:", error);
                        alert("删除失败，请稍后再试。");
                    }
                }
            });
            chatListEl.appendChild(item);
        });
    }

    window.renderChatListProxy = renderChatList;

    function renderChatInterface(chatId) {
        const chat = state.chats[chatId];
        if (!chat) return;
        exitSelectionMode();
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.dataset.theme = chat.settings.theme || 'default';
        document.getElementById('chat-header-title').textContent = chat.name;
        messagesContainer.innerHTML = '';
        const chatScreen = document.getElementById('chat-interface-screen');
        chatScreen.style.backgroundImage = chat.settings.background ? `url(${chat.settings.background})` : 'none';
        chatScreen.style.backgroundColor = chat.settings.background ? 'transparent' : '#f0f2f5';
        const history = chat.history;
        const totalMessages = history.length;
        currentRenderedCount = 0;
        const initialMessages = history.slice(-MESSAGE_RENDER_WINDOW);
        initialMessages.forEach(msg => appendMessage(msg, chat, true));
        currentRenderedCount = initialMessages.length;
        if (totalMessages > currentRenderedCount) {
            prependLoadMoreButton(messagesContainer);
        }
        const typingIndicator = document.createElement('div');
        typingIndicator.id = 'typing-indicator';
        typingIndicator.style.display = 'none';
        typingIndicator.textContent = '对方正在输入...';
        messagesContainer.appendChild(typingIndicator);
        setTimeout(() => messagesContainer.scrollTop = messagesContainer.scrollHeight, 0);
    }

    function prependLoadMoreButton(container) {
        const button = document.createElement('button');
        button.id = 'load-more-btn';
        button.textContent = '加载更早的记录';
        button.addEventListener('click', loadMoreMessages);
        container.prepend(button);
    }

    function loadMoreMessages() {
        const messagesContainer = document.getElementById('chat-messages');
        const chat = state.chats[state.activeChatId];
        if (!chat) return;
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) loadMoreBtn.remove();
        const totalMessages = chat.history.length;
        const nextSliceStart = totalMessages - currentRenderedCount - MESSAGE_RENDER_WINDOW;
        const nextSliceEnd = totalMessages - currentRenderedCount;
        const messagesToPrepend = chat.history.slice(Math.max(0, nextSliceStart), nextSliceEnd);
        const oldScrollHeight = messagesContainer.scrollHeight;
        messagesToPrepend.reverse().forEach(msg => prependMessage(msg, chat));
        currentRenderedCount += messagesToPrepend.length;
        const newScrollHeight = messagesContainer.scrollHeight;
        messagesContainer.scrollTop += (newScrollHeight - oldScrollHeight);
        if (totalMessages > currentRenderedCount) {
            prependLoadMoreButton(messagesContainer);
        }
    }

    function switchStylesheet(url) {
        const stylesheet = document.getElementById('main-stylesheet');
        if (stylesheet) {
            if (url && url.trim() !== '') {
                stylesheet.href = url + '?v=' + Date.now();
            } else {
                stylesheet.href = './style.css';
            }
        }
    }

    function renderWallpaperScreen() {
        const preview = document.getElementById('wallpaper-preview');
        const bg = newWallpaperBase64 || state.globalSettings.wallpaper;
        if (bg && bg.startsWith('data:image')) {
            preview.style.backgroundImage = `url(${bg})`;
            preview.textContent = '';
        } else if (bg) {
            preview.style.backgroundImage = bg;
            preview.textContent = '当前为渐变色';
        }
    }

    window.renderWallpaperScreenProxy = renderWallpaperScreen;

    function applyGlobalWallpaper() {
        const homeScreen = document.getElementById('home-screen');
        const wallpaper = state.globalSettings.wallpaper;
        if (wallpaper && wallpaper.startsWith('data:image')) homeScreen.style.backgroundImage = `url(${wallpaper})`; else if (wallpaper) homeScreen.style.backgroundImage = wallpaper;
    }

    function renderWorldBookScreen() {
        const listEl = document.getElementById('world-book-list');
        listEl.innerHTML = '';
        if (state.worldBooks.length === 0) {
            listEl.innerHTML = '<p style="text-align:center; color: #8a8a8a; margin-top: 50px;">点击右上角 "+" 创建你的第一本世界书</p>';
            return;
        }
        state.worldBooks.forEach(book => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.dataset.bookId = book.id;
            item.innerHTML = `<div class="item-title">${book.name}</div><div class="item-content">${(book.content || '暂无内容...').substring(0, 50)}</div>`;
            item.addEventListener('click', () => openWorldBookEditor(book.id));
            addLongPressListener(item, async () => {
                const confirmed = await showCustomConfirm('删除世界书', `确定要删除《${book.name}》吗？此操作不可撤销。`, {confirmButtonClass: 'btn-danger'});
                if (confirmed) {
                    await db.worldBooks.delete(book.id);
                    state.worldBooks = state.worldBooks.filter(wb => wb.id !== book.id);
                    renderWorldBookScreen();
                }
            });
            listEl.appendChild(item);
        });
    }

    window.renderWorldBookScreenProxy = renderWorldBookScreen;

    function openWorldBookEditor(bookId) {
        editingWorldBookId = bookId;
        const book = state.worldBooks.find(wb => wb.id === bookId);
        if (!book) return;
        document.getElementById('world-book-editor-title').textContent = book.name;
        document.getElementById('world-book-name-input').value = book.name;
        document.getElementById('world-book-content-input').value = book.content;
        showScreen('world-book-editor-screen');
    }

    function renderStickerPanel() {
        const grid = document.getElementById('sticker-grid');
        grid.innerHTML = '';
        if (state.userStickers.length === 0) {
            grid.innerHTML = '<p style="text-align:center; color: var(--text-secondary); grid-column: 1 / -1;">大人请点击右上角“添加”或“上传”来添加你的第一个表情吧！</p>';
            return;
        }
        state.userStickers.forEach(sticker => {
            const item = document.createElement('div');
            item.className = 'sticker-item';
            item.style.backgroundImage = `url(${sticker.url})`;
            item.title = sticker.name;
            item.addEventListener('click', () => sendSticker(sticker));
            addLongPressListener(item, () => {
                if (isSelectionMode) return;
                const existingDeleteBtn = item.querySelector('.delete-btn');
                if (existingDeleteBtn) return;
                const deleteBtn = document.createElement('div');
                deleteBtn.className = 'delete-btn';
                deleteBtn.innerHTML = '&times;';
                deleteBtn.onclick = async (e) => {
                    e.stopPropagation();
                    const confirmed = await showCustomConfirm('删除表情', `确定要删除表情 "${sticker.name}" 吗？`, {confirmButtonClass: 'btn-danger'});
                    if (confirmed) {
                        await db.userStickers.delete(sticker.id);
                        state.userStickers = state.userStickers.filter(s => s.id !== sticker.id);
                        renderStickerPanel();
                    }
                };
                item.appendChild(deleteBtn);
                deleteBtn.style.display = 'block';
                setTimeout(() => item.addEventListener('mouseleave', () => deleteBtn.remove(), {once: true}), 3000);
            });
            grid.appendChild(item);
        });
    }

    function createMessageElement(msg, chat) {
        if (msg.type === 'pat') {
            const wrapper = document.createElement('div');
            wrapper.className = 'system-message-container';
            wrapper.innerHTML = `<span>${msg.content}</span>`;
            return wrapper;
        }

        const isUser = msg.role === 'user';
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${isUser ? 'user' : 'ai'}`;
        if (chat.isGroup && !isUser) {
            const senderNameDiv = document.createElement('div');
            senderNameDiv.className = 'sender-name';
            senderNameDiv.textContent = msg.senderName || '未知成员';
            wrapper.appendChild(senderNameDiv);
        }
        const bubble = document.createElement('div');
        bubble.className = `message-bubble ${isUser ? 'user' : 'ai'}`;
        bubble.dataset.timestamp = msg.timestamp;

        bubble.addEventListener('dblclick', () => {
            // 编辑模式下禁止拍一拍
            if (isMessageEditMode) return;
            handlePat(msg);
        });
        let avatarSrc;
        if (chat.isGroup) {
            if (isUser) {
                avatarSrc = chat.settings.myAvatar || defaultMyGroupAvatar;
            } else {
                const member = chat.members.find(m => m.name === msg.senderName);
                avatarSrc = member ? member.avatar : defaultGroupMemberAvatar;
            }
        } else {
            avatarSrc = isUser ? (chat.settings.myAvatar || defaultAvatar) : (chat.settings.aiAvatar || defaultAvatar);
        }
        let contentHtml;
        if (msg.type === 'user_photo' || msg.type === 'ai_image') {
            bubble.classList.add('is-ai-image');
            const altText = msg.type === 'user_photo' ? "用户描述的照片" : "AI生成的图片";
            contentHtml = `<img src="https://i.postimg.cc/KYr2qRCK/1.jpg" class="ai-generated-image" alt="${altText}" data-description="${msg.content}">`;
        } else if (msg.type === 'voice_message') {
            bubble.classList.add('is-voice-message');
            const duration = Math.max(1, Math.round((msg.content || '').length / 5));
            const durationFormatted = `0:${String(duration).padStart(2, '0')}''`;
            const waveformHTML = '<div></div><div></div><div></div><div></div><div></div>';
            contentHtml = `<div class="voice-message-body" data-text="${msg.content}"><div class="voice-waveform">${waveformHTML}</div><span class="voice-duration">${durationFormatted}</span></div>`;
        } else if (msg.type === 'transfer') {
            bubble.classList.add('is-transfer');
            const titleText = isUser ? '转账给Ta' : '收到一笔转账';
            const heartIcon = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style="vertical-align: middle;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>`;
            contentHtml = `<div class="transfer-card"><div class="transfer-title">${heartIcon} ${titleText}</div><div class="transfer-amount">¥ ${Number(msg.amount).toFixed(2)}</div><div class="transfer-note">${msg.note || '对方没有留下备注哦~'}</div></div>`;
        } else if (typeof msg.content === 'string' && STICKER_REGEX.test(msg.content)) {
            bubble.classList.add('is-sticker');
            contentHtml = `<img src="${msg.content}" alt="${msg.meaning || 'Sticker'}" class="sticker-image">`;
        } else if (Array.isArray(msg.content) && msg.content[0]?.type === 'image_url') {
            bubble.classList.add('has-image');
            const imageUrl = msg.content[0].image_url.url;
            contentHtml = `<img src="${imageUrl}" class="chat-image" alt="User uploaded image">`;
        } else {
            contentHtml = String(msg.content || '').replace(/\n/g, '<br>');
        }
        bubble.innerHTML = `<div class="avatar-group"><img src="${avatarSrc}" class="avatar"><span class="timestamp">${formatTimestamp(msg.timestamp)}</span></div><div class="content">${contentHtml}</div>`;
        addLongPressListener(bubble, () => enterSelectionMode(msg.timestamp));
        bubble.addEventListener('click', () => {
            if (isSelectionMode) toggleMessageSelection(msg.timestamp);
        });
        wrapper.appendChild(bubble);
        return wrapper;
    }

    function prependMessage(msg, chat) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageEl = createMessageElement(msg, chat);
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            messagesContainer.insertBefore(messageEl, loadMoreBtn.nextSibling);
        } else {
            messagesContainer.prepend(messageEl);
        }
    }

    function appendMessage(msg, chat, isInitialLoad = false) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageEl = createMessageElement(msg, chat);
        const typingIndicator = document.getElementById('typing-indicator');
        messagesContainer.insertBefore(messageEl, typingIndicator);
        if (!isInitialLoad) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            currentRenderedCount++;
        }
    }

    function openChat(chatId) {
        state.activeChatId = chatId;
        renderChatInterface(chatId);
        showScreen('chat-interface-screen');
    }

    async function triggerAiResponse() {
        if (!state.activeChatId) return;
        const chatId = state.activeChatId;
        const chat = state.chats[chatId];
        document.getElementById('typing-indicator').style.display = 'block';

        const {proxyUrl: rawProxyUrl, apiKey, model} = state.apiConfig;

        if (!rawProxyUrl || !apiKey || !model) {
            alert('请先在API设置中配置反代地址、密钥并选择模型。');
            document.getElementById('typing-indicator').style.display = 'none';
            return;
        }

        // 处理/v1/v1问题
        let proxyUrl = rawProxyUrl ? rawProxyUrl.trim() : '';
        if (proxyUrl.endsWith('/')) {
            proxyUrl = proxyUrl.slice(0, -1);
        }
        if (proxyUrl.endsWith('/v1')) {
            proxyUrl = proxyUrl.slice(0, -3);
        }

        const now = new Date();
        const currentTime = now.toLocaleTimeString('zh-CN', {hour: 'numeric', minute: 'numeric', hour12: true});
        let myAddressInfo = '';
        if (state.globalSettings.enableGeolocation && myAddress !== '位置未知' && myAddress !== '位置获取失败') {
            myAddressInfo = `- **用户的当前位置**: ${myAddress}。\n`;
        }
        let worldBookContent = '';
        if (chat.settings.linkedWorldBookIds && chat.settings.linkedWorldBookIds.length > 0) {
            const linkedContents = chat.settings.linkedWorldBookIds.map(bookId => {
                const worldBook = state.worldBooks.find(wb => wb.id === bookId);
                return worldBook && worldBook.content ? `\n\n## 世界书: ${worldBook.name}\n${worldBook.content}` : '';
            }).filter(Boolean).join('');
            if (linkedContents) {
                worldBookContent = `\n\n# 核心世界观设定 (必须严格遵守以下所有设定)\n${linkedContents}\n`;
            }
        }
        let musicContext = '';
        if (musicState.isActive && musicState.activeChatId === chatId && musicState.currentIndex > -1) {
            const currentTrack = musicState.playlist[musicState.currentIndex];
            musicContext = `\n\n# 当前情景\n你正在和用户一起听歌。当前播放的歌曲是：${currentTrack.name} - ${currentTrack.artist}。请在对话中自然地融入这个情境。\n`;
        }
        let systemPrompt, messagesPayload;
        const maxMemory = parseInt(chat.settings.maxMemory) || 10;
        const historySlice = chat.history.slice(-maxMemory);
        const activePreset = state.presets.find(p => p.id === state.globalSettings.activePresetId) || state.presets[0];
        const aiImageInstructions = activePreset?.promptImage || DEFAULT_PROMPT_IMAGE;
        const aiVoiceInstructions = activePreset?.promptVoice || DEFAULT_PROMPT_VOICE;
        const transferInstructions = activePreset?.promptTransfer || DEFAULT_PROMPT_TRANSFER;
        if (chat.isGroup) {
            const membersList = chat.members.map(m => `- **${m.name}**: ${m.persona}`).join('\n');
            const myNickname = chat.settings.myNickname || '我';
            const groupAiImageInstructions = `\n# 发送图片的能力\n- 群成员无法真正发送图片文件。但当用户要求某位成员发送照片，或者某个成员想通过图片来表达时，该成员可以发送一张“文字描述的图片”。\n- 若要发送图片，请在你的回复JSON数组中，为该角色单独发送一个特殊的对象，格式为：\`{"name": "角色名", "type": "ai_image", "description": "这里是对图片的详细文字描述..."}\`。描述应该符合该角色的性格和当时的语境。`;
            const groupAiVoiceInstructions = `\n# 发送语音的能力\n- 群成员同样可以发送“模拟语音消息”。\n- 若要发送语音，请为该角色单独发送一个特殊的对象，格式为：\`{"name": "角色名", "type": "voice_message", "content": "这里是语音的文字内容..."}\`。当历史记录中出现 "[角色名 发送了一条语音，内容是：'xxx']" 时，代表该角色用语音说了'xxx'。其他角色应该对此内容做出回应。`;
            let baseGroupPrompt = activePreset?.promptGroup || DEFAULT_PROMPT_GROUP;
            systemPrompt = baseGroupPrompt
                .replace('{myAddress}', myAddressInfo)
                .replace('{worldBookContent}', worldBookContent)
                .replace('{musicContext}', musicContext)
                .replace('{currentTime}', currentTime)
                .replace('{chat.settings.myPersona}', chat.settings.myPersona || '')
                .replace(/{myNickname}/g, myNickname)
                .replace('{groupAiImageInstructions}', groupAiImageInstructions)
                .replace('{groupAiVoiceInstructions}', groupAiVoiceInstructions)
                .replace('{membersList}', membersList);
            messagesPayload = historySlice.map(msg => {
                if (msg.type === 'pat') {
                    return {role: 'user', content: `[拍一拍 ${msg.content}]`};
                }
                const sender = msg.role === 'user' ? (chat.settings.myNickname || '我') : msg.senderName;
                let content;
                if (msg.type === 'user_photo') content = `[${sender} 发送了一张描述的照片，内容是：'${msg.content}']`;
                else if (msg.type === 'ai_image') content = `[${sender} 发送了一张图片]`;
                else if (msg.type === 'voice_message') content = `[${sender} 发送了一条语音，内容是：'${msg.content}']`;
                else if (msg.type === 'transfer') content = `[${msg.senderName}向${msg.receiverName}转账 ${msg.amount}元, 备注: ${msg.note}]`;
                else if (msg.meaning) content = `${sender}: [发送了一个表情，意思是: '${msg.meaning}']`;
                else if (Array.isArray(msg.content)) content = [...msg.content, {type: 'text', text: `${sender}:`}];
                else content = `${sender}: ${msg.content}`;
                return {role: 'user', content: content};
            });
        } else {
            let baseSinglePrompt = activePreset?.promptSingle || DEFAULT_PROMPT_SINGLE;
            systemPrompt = baseSinglePrompt
                .replace('{myAddress}', myAddressInfo)
                .replace(/{chat.name}/g, chat.name)
                .replace(/{currentTime}/g, currentTime)
                .replace('{worldBookContent}', worldBookContent)
                .replace('{musicContext}', musicContext)
                .replace(/{chat.settings.aiPersona}/g, chat.settings.aiPersona || '')
                .replace(/{chat.settings.myPersona}/g, chat.settings.myPersona || '')
                .replace('{aiImageInstructions}', aiImageInstructions)
                .replace('{aiVoiceInstructions}', aiVoiceInstructions)
                .replace('{transferInstructions}', transferInstructions);
            messagesPayload = historySlice.map(msg => {
                if (msg.type === 'pat') {
                    return {role: 'user', content: `[拍一拍 ${msg.content}]`};
                }
                if (msg.type === 'user_photo') return {
                    role: 'user',
                    content: `[你收到了一张用户描述的照片，照片内容是：'${msg.content}']`
                };
                if (msg.type === 'ai_image') return {
                    role: 'assistant',
                    content: JSON.stringify({type: 'ai_image', description: msg.content})
                };
                if (msg.type === 'voice_message') {
                    if (msg.role === 'user') return {
                        role: 'user',
                        content: `[用户发来一条语音消息，内容是：'${msg.content}']`
                    };
                    else return {
                        role: 'assistant',
                        content: JSON.stringify({type: 'voice_message', content: msg.content})
                    };
                }
                if (msg.type === 'transfer') {
                    if (msg.role === 'user') return {
                        role: 'user',
                        content: `[你收到了来自用户的转账: ${msg.amount}元, 备注: ${msg.note}]`
                    };
                    else return {
                        role: 'assistant',
                        content: JSON.stringify({type: 'transfer', amount: msg.amount, note: msg.note})
                    };
                }
                if (msg.role === 'user' && msg.meaning) return {
                    role: 'user',
                    content: `[用户发送了一个表情，意思是：'${msg.meaning}']`
                };
                if (typeof msg.content === 'string' || Array.isArray(msg.content)) return {
                    role: msg.role,
                    content: msg.content
                };
                return null;
            }).filter(Boolean);
        }
        try {
            const response = await fetch(`${proxyUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`},
                body: JSON.stringify({
                    model: model,
                    messages: [{role: 'system', content: systemPrompt}, ...messagesPayload],
                    temperature: 0.8,
                    stream: false
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${response.status} - ${errorData.error.message}`);
            }
            const data = await response.json();
            const aiResponseContent = data.choices[0].message.content;
            const messagesArray = parseAiResponse(aiResponseContent);
            let notificationShown = false;
            const isViewingThisChat = document.getElementById('chat-interface-screen').classList.contains('active') && state.activeChatId === chatId;
            for (const msgData of messagesArray) {
                let aiMessage;
                const senderName = chat.isGroup ? (msgData.name || '未知') : chat.name;
                const receiverName = chat.isGroup ? (msgData.receiver || '我') : '我';
                if (typeof msgData === 'object' && msgData.type === 'voice_message') {
                    aiMessage = {
                        role: 'assistant',
                        type: 'voice_message',
                        content: msgData.content,
                        senderName: senderName,
                        timestamp: Date.now()
                    };
                } else if (typeof msgData === 'object' && msgData.type === 'ai_image') {
                    aiMessage = {
                        role: 'assistant',
                        type: 'ai_image',
                        content: msgData.description,
                        senderName: senderName,
                        timestamp: Date.now()
                    };
                } else if (typeof msgData === 'object' && msgData.type === 'transfer') {
                    aiMessage = {
                        role: 'assistant',
                        type: 'transfer',
                        amount: msgData.amount,
                        note: msgData.note,
                        senderName: senderName,
                        receiverName: receiverName,
                        timestamp: Date.now()
                    };
                } else if (chat.isGroup) {
                    if (typeof msgData === 'object' && msgData.name && msgData.message) aiMessage = {
                        role: 'assistant',
                        senderName: msgData.name,
                        content: String(msgData.message),
                        timestamp: Date.now()
                    }; else continue;
                } else {
                    aiMessage = {role: 'assistant', content: String(msgData), timestamp: Date.now()};
                }
                chat.history.push(aiMessage);
                await db.chats.put(chat);
                if (isViewingThisChat) {
                    appendMessage(aiMessage, chat);
                    await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 300));
                }
                if (!isViewingThisChat && !notificationShown) {
                    let notificationText;
                    if (aiMessage.type === 'transfer') notificationText = `[收到一笔转账]`; else if (aiMessage.type === 'ai_image') notificationText = `[图片]`; else if (aiMessage.type === 'voice_message') notificationText = `[语音]`; else notificationText = STICKER_REGEX.test(aiMessage.content) ? '[表情]' : String(aiMessage.content);
                    const finalNotifText = chat.isGroup ? `${aiMessage.senderName}: ${notificationText}` : notificationText;
                    showNotification(chatId, finalNotifText);
                    notificationShown = true;
                }
            }
        } catch (error) {
            const errorContent = `[出错了: ${error.message}]`;
            const errorMessage = {role: 'assistant', content: errorContent, timestamp: Date.now()};
            if (chat) {
                chat.history.push(errorMessage);
                await db.chats.put(chat);
                appendMessage(errorMessage, chat);
            }
            console.error(error);
        } finally {
            if (document.getElementById('typing-indicator')) document.getElementById('typing-indicator').style.display = 'none';
            renderChatList();
        }
    }



    async function sendSticker(sticker) {
        if (!state.activeChatId) return;
        const chat = state.chats[state.activeChatId];
        const msg = {role: 'user', content: sticker.url, meaning: sticker.name, timestamp: Date.now()};
        chat.history.push(msg);
        await db.chats.put(chat);
        appendMessage(msg, chat);
        renderChatList();
        document.getElementById('sticker-panel').classList.remove('visible');
    }

    async function sendUserTransfer() {
        if (!state.activeChatId) return;
        const amountInput = document.getElementById('transfer-amount');
        const noteInput = document.getElementById('transfer-note');
        const amount = parseFloat(amountInput.value);
        const note = noteInput.value.trim();
        if (isNaN(amount) || amount < 0 || amount > 9999) {
            alert('请输入有效的金额 (0 到 9999 之间)！');
            return;
        }
        const chat = state.chats[state.activeChatId];
        const senderName = chat.isGroup ? (chat.settings.myNickname || '我') : '我';
        const receiverName = chat.isGroup ? '群聊' : chat.name;
        const msg = {
            role: 'user',
            type: 'transfer',
            amount: amount,
            note: note,
            senderName,
            receiverName,
            timestamp: Date.now()
        };
        chat.history.push(msg);
        await db.chats.put(chat);
        appendMessage(msg, chat);
        renderChatList();
        document.getElementById('transfer-modal').classList.remove('visible');
        amountInput.value = '';
        noteInput.value = '';
    }

    function enterSelectionMode(initialMsgTimestamp) {
        if (isMessageEditMode) {
            exitMessageEditMode(false);
        }
        if (isSelectionMode) return;
        isSelectionMode = true;
        document.getElementById('chat-interface-screen').classList.add('selection-mode');
        toggleMessageSelection(initialMsgTimestamp);
    }

    async function exitMessageEditMode(shouldSave = false) {
        if (!isMessageEditMode) return;

        const editBtnImg = document.querySelector('#edit-messages-btn img');
        editBtnImg.src = 'https://i.postimg.cc/V60TWbGr/image.png'; // Edit icon
        editBtnImg.alt = '编辑';
        document.querySelector('#edit-messages-btn').title = '编辑消息';

        const chat = state.chats[state.activeChatId];
        let changesMade = false;

        document.querySelectorAll('.message-bubble .content.editable').forEach(contentEl => {
            if (shouldSave) {
                const timestamp = parseInt(contentEl.closest('.message-bubble').dataset.timestamp, 10);
                const newContent = contentEl.innerHTML;

                const message = chat.history.find(msg => msg.timestamp === timestamp);
                if (message && message.content !== newContent) {
                    message.content = newContent;
                    changesMade = true;
                }
            }
            contentEl.contentEditable = false;
            contentEl.classList.remove('editable');
        });

        if (shouldSave && changesMade) {
            await db.chats.put(chat);
            showCustomAlert('保存成功', '消息已更新。');
        }

        isMessageEditMode = false;
    }

    function enterMessageEditMode() {
        if (isMessageEditMode) return;

        const editBtnImg = document.querySelector('#edit-messages-btn img');
        editBtnImg.src = 'https://i.postimg.cc/GtrQTBZ1/image.png';
        editBtnImg.alt = '保存';
        document.querySelector('#edit-messages-btn').title = '保存编辑';

        document.querySelectorAll('.message-bubble:not(.system-message-container) .content').forEach(contentEl => {
            const bubble = contentEl.closest('.message-bubble');
            if (bubble && !bubble.classList.contains('is-sticker') &&
                !bubble.classList.contains('is-voice-message') &&
                !bubble.classList.contains('is-transfer') &&
                !bubble.classList.contains('is-ai-image') &&
                !bubble.classList.contains('has-image')) {
                contentEl.contentEditable = true;
                contentEl.classList.add('editable');
            }
        });
        isMessageEditMode = true;
        showCustomAlert('进入编辑模式', '您现在可以点击消息气泡来编辑其内容。完成后，请再次点击“保存”按钮。');
    }

    async function toggleMessageEditMode() {
        if (!state.activeChatId) return;

        if (isMessageEditMode) {
            await exitMessageEditMode(true); // Exit and save
        } else {
            enterMessageEditMode(); // Enter
        }
    }

    function exitSelectionMode() {
        if (!isSelectionMode) return;
        isSelectionMode = false;
        document.getElementById('chat-interface-screen').classList.remove('selection-mode');
        selectedMessages.forEach(ts => {
            const bubble = document.querySelector(`.message-bubble[data-timestamp="${ts}"]`);
            if (bubble) bubble.classList.remove('selected');
        });
        selectedMessages.clear();
    }

    function toggleMessageSelection(timestamp) {
        const bubble = document.querySelector(`.message-bubble[data-timestamp="${timestamp}"]`);
        if (!bubble) return;
        if (selectedMessages.has(timestamp)) {
            selectedMessages.delete(timestamp);
            bubble.classList.remove('selected');
        } else {
            selectedMessages.add(timestamp);
            bubble.classList.add('selected');
        }
        document.getElementById('selection-count').textContent = `已选 ${selectedMessages.size} 条`;
        if (selectedMessages.size === 0) exitSelectionMode();
    }

    function addLongPressListener(element, callback) {
        let pressTimer;
        const startPress = (e) => {
            if (isSelectionMode) return;
            // e.preventDefault(); // <-- 移除此行来修复双击事件冲突
            pressTimer = window.setTimeout(() => callback(e), 500);
        };
        const cancelPress = () => clearTimeout(pressTimer);
        element.addEventListener('mousedown', startPress);
        element.addEventListener('mouseup', cancelPress);
        element.addEventListener('mouseleave', cancelPress);
        element.addEventListener('touchstart', startPress, {passive: true}); // passive:true 也能帮助避免冲突
        element.addEventListener('touchend', cancelPress);
        element.addEventListener('touchmove', cancelPress);
    }

    async function handleListenTogetherClick() {
        const targetChatId = state.activeChatId;
        if (!targetChatId) return;
        if (!musicState.isActive) {
            startListenTogetherSession(targetChatId);
            return;
        }
        if (musicState.activeChatId === targetChatId) {
            document.getElementById('music-player-overlay').classList.add('visible');
        } else {
            const oldChatName = state.chats[musicState.activeChatId]?.name || '未知';
            const newChatName = state.chats[targetChatId]?.name || '当前';
            const confirmed = await showCustomConfirm('切换听歌对象', `您正和「${oldChatName}」听歌。要结束并开始和「${newChatName}」的新会话吗？`, {confirmButtonClass: 'btn-danger'});
            if (confirmed) {
                await endListenTogetherSession(true);
                await new Promise(resolve => setTimeout(resolve, 50));
                startListenTogetherSession(targetChatId);
            }
        }
    }

    async function startListenTogetherSession(chatId) {
        const chat = state.chats[chatId];
        if (!chat) return;
        musicState.totalElapsedTime = chat.musicData.totalTime || 0;
        musicState.isActive = true;
        musicState.activeChatId = chatId;
        if (musicState.playlist.length > 0) {
            musicState.currentIndex = 0;
        } else {
            musicState.currentIndex = -1;
        }
        if (musicState.timerId) clearInterval(musicState.timerId);
        musicState.timerId = setInterval(() => {
            if (musicState.isPlaying) {
                musicState.totalElapsedTime++;
                updateElapsedTimeDisplay();
            }
        }, 1000);
        updatePlayerUI();
        updatePlaylistUI();
        document.getElementById('music-player-overlay').classList.add('visible');
    }

    async function endListenTogetherSession(saveState = true) {
        if (!musicState.isActive) return;
        const oldChatId = musicState.activeChatId;
        if (musicState.timerId) clearInterval(musicState.timerId);
        if (musicState.isPlaying) audioPlayer.pause();
        if (saveState && oldChatId && state.chats[oldChatId]) {
            const chat = state.chats[oldChatId];
            chat.musicData.totalTime = musicState.totalElapsedTime;
            await db.chats.put(chat);
        }
        musicState.isActive = false;
        musicState.activeChatId = null;
        musicState.totalElapsedTime = 0;
        musicState.timerId = null;
        document.getElementById('music-player-overlay').classList.remove('visible');
        document.getElementById('music-playlist-panel').classList.remove('visible');
        updateListenTogetherIcon(oldChatId, true);
    }

    function returnToChat() {
        document.getElementById('music-player-overlay').classList.remove('visible');
        document.getElementById('music-playlist-panel').classList.remove('visible');
    }

    function updateListenTogetherIcon(chatId, forceReset = false) {
        const iconImg = document.querySelector('#listen-together-btn img');
        if (!iconImg) return;
        if (forceReset || !musicState.isActive || musicState.activeChatId !== chatId) {
            iconImg.src = 'https://i.postimg.cc/8kYShvrJ/90-UI-2.png';
            iconImg.className = '';
            return;
        }
        iconImg.src = 'https://i.postimg.cc/vBN7GnQ9/3-FC8-D1596-C5-CFB200-FCB1-D8-C3-A37-A370.png';
        iconImg.classList.add('rotating');
        if (musicState.isPlaying) iconImg.classList.remove('paused'); else iconImg.classList.add('paused');
    }

    window.updateListenTogetherIconProxy = updateListenTogetherIcon;

    function updatePlayerUI() {
        updateListenTogetherIcon(musicState.activeChatId);
        updateElapsedTimeDisplay();
        const titleEl = document.getElementById('music-player-song-title');
        const artistEl = document.getElementById('music-player-artist');
        const playPauseBtn = document.getElementById('music-play-pause-btn');
        if (musicState.currentIndex > -1 && musicState.playlist.length > 0) {
            const track = musicState.playlist[musicState.currentIndex];
            titleEl.textContent = track.name;
            artistEl.textContent = track.artist;
        } else {
            titleEl.textContent = '请添加歌曲';
            artistEl.textContent = '...';
        }
        playPauseBtn.textContent = musicState.isPlaying ? '❚❚' : '▶';
    }

    function updateElapsedTimeDisplay() {
        const hours = (musicState.totalElapsedTime / 3600).toFixed(1);
        document.getElementById('music-time-counter').textContent = `已经一起听了${hours}小时`;
    }

    function updatePlaylistUI() {
        const playlistBody = document.getElementById('playlist-body');
        playlistBody.innerHTML = '';
        if (musicState.playlist.length === 0) {
            playlistBody.innerHTML = '<p style="text-align:center; padding: 20px; color: #888;">播放列表是空的~</p>';
            return;
        }
        musicState.playlist.forEach((track, index) => {
            const item = document.createElement('div');
            item.className = 'playlist-item';
            if (index === musicState.currentIndex) item.classList.add('playing');
            item.innerHTML = `<div class="playlist-item-info"><div class="title">${track.name}</div><div class="artist">${track.artist}</div></div><span class="delete-track-btn" data-index="${index}">&times;</span>`;
            item.querySelector('.playlist-item-info').addEventListener('click', () => playSong(index));
            item.querySelector('.delete-track-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                const confirmed = await showCustomConfirm('删除歌曲', `确定要从播放列表中删除《${track.name}》吗？`);
                if (confirmed) deleteTrack(index);
            });
            playlistBody.appendChild(item);
        });
    }

    function playSong(index) {
        if (index < 0 || index >= musicState.playlist.length) return;
        musicState.currentIndex = index;
        const track = musicState.playlist[index];
        if (track.isLocal && track.src instanceof Blob) {
            audioPlayer.src = URL.createObjectURL(track.src);
        } else if (!track.isLocal) {
            audioPlayer.src = track.src;
        } else {
            console.error('本地歌曲源错误:', track);
            return;
        }
        audioPlayer.play();
        updatePlaylistUI();
        updatePlayerUI();
    }

    function togglePlayPause() {
        if (audioPlayer.paused) {
            if (musicState.currentIndex === -1 && musicState.playlist.length > 0) {
                playSong(0);
            } else if (musicState.currentIndex > -1) {
                audioPlayer.play();
            }
        } else {
            audioPlayer.pause();
        }
    }

    function playNext() {
        if (musicState.playlist.length === 0) return;
        let nextIndex;
        switch (musicState.playMode) {
            case 'random':
                nextIndex = Math.floor(Math.random() * musicState.playlist.length);
                break;
            case 'single':
                playSong(musicState.currentIndex);
                return;
            case 'order':
            default:
                nextIndex = (musicState.currentIndex + 1) % musicState.playlist.length;
                break;
        }
        playSong(nextIndex);
    }

    function playPrev() {
        if (musicState.playlist.length === 0) return;
        const newIndex = (musicState.currentIndex - 1 + musicState.playlist.length) % musicState.playlist.length;
        playSong(newIndex);
    }

    function changePlayMode() {
        const modes = ['order', 'random', 'single'];
        const currentModeIndex = modes.indexOf(musicState.playMode);
        musicState.playMode = modes[(currentModeIndex + 1) % modes.length];
        document.getElementById('music-mode-btn').textContent = {
            'order': '顺序',
            'random': '随机',
            'single': '单曲'
        }[musicState.playMode];
    }

    async function addSongFromURL() {
        const url = await showCustomPrompt("添加网络歌曲", "请输入歌曲的URL", "", "url");
        if (!url) return;
        const name = await showCustomPrompt("歌曲信息", "请输入歌名");
        if (!name) return;
        const artist = await showCustomPrompt("歌曲信息", "请输入歌手名");
        if (!artist) return;
        musicState.playlist.push({name, artist, src: url, isLocal: false});
        await saveGlobalPlaylist();
        updatePlaylistUI();
        if (musicState.currentIndex === -1) {
            musicState.currentIndex = musicState.playlist.length - 1;
            updatePlayerUI();
        }
    }

    async function addSongFromLocal(event) {
        const files = event.target.files;
        if (!files.length) return;
        for (const file of files) {
            const name = await showCustomPrompt("歌曲信息", "请输入歌名", "");
            if (name === null) continue;
            const artist = await showCustomPrompt("歌曲信息", "请输入歌手名", "");
            if (artist === null) continue;
            musicState.playlist.push({name, artist, src: file, isLocal: true});
        }
        await saveGlobalPlaylist();
        updatePlaylistUI();
        if (musicState.currentIndex === -1 && musicState.playlist.length > 0) {
            musicState.currentIndex = 0;
            updatePlayerUI();
        }
        event.target.value = null;
    }

    async function deleteTrack(index) {
        if (index < 0 || index >= musicState.playlist.length) return;
        const track = musicState.playlist[index];
        const wasPlaying = musicState.isPlaying && musicState.currentIndex === index;
        if (track.isLocal && audioPlayer.src.startsWith('blob:') && musicState.currentIndex === index) URL.revokeObjectURL(audioPlayer.src);
        musicState.playlist.splice(index, 1);
        await saveGlobalPlaylist();
        if (musicState.playlist.length === 0) {
            if (musicState.isPlaying) audioPlayer.pause();
            audioPlayer.src = '';
            musicState.currentIndex = -1;
            musicState.isPlaying = false;
        } else {
            if (wasPlaying) {
                playNext();
            } else {
                if (musicState.currentIndex >= index) musicState.currentIndex = Math.max(0, musicState.currentIndex - 1);
            }
        }
        updatePlayerUI();
        updatePlaylistUI();
    }

    const personaLibraryModal = document.getElementById('persona-library-modal');
    const personaEditorModal = document.getElementById('persona-editor-modal');
    const presetActionsModal = document.getElementById('preset-actions-modal');

    function openPersonaLibrary() {
        renderPersonaLibrary();
        personaLibraryModal.classList.add('visible');
    }

    function closePersonaLibrary() {
        personaLibraryModal.classList.remove('visible');
    }

    function renderPersonaLibrary() {
        const grid = document.getElementById('persona-library-grid');
        grid.innerHTML = '';
        if (state.personaPresets.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1 / -1; text-align: center; margin-top: 20px;">空空如也~ 点击右上角"添加"来创建你的第一个人设预设吧！</p>';
            return;
        }
        state.personaPresets.forEach(preset => {
            const item = document.createElement('div');
            item.className = 'persona-preset-item';
            item.style.backgroundImage = `url(${preset.avatar})`;
            item.dataset.presetId = preset.id;
            item.addEventListener('click', () => applyPersonaPreset(preset.id));
            addLongPressListener(item, () => showPresetActions(preset.id));
            grid.appendChild(item);
        });
    }

    function showPresetActions(presetId) {
        editingPersonaPresetId = presetId;
        presetActionsModal.classList.add('visible');
    }

    function hidePresetActions() {
        presetActionsModal.classList.remove('visible');
        editingPersonaPresetId = null;
    }

    function applyPersonaPreset(presetId) {
        const preset = state.personaPresets.find(p => p.id === presetId);
        if (preset) {
            document.getElementById('my-avatar-preview').src = preset.avatar;
            document.getElementById('my-persona').value = preset.persona;
        }
        closePersonaLibrary();
    }

    function openPersonaEditorForCreate() {
        editingPersonaPresetId = null;
        document.getElementById('persona-editor-title').textContent = '添加人设预设';
        document.getElementById('preset-avatar-preview').src = defaultAvatar;
        document.getElementById('preset-persona-input').value = '';
        personaEditorModal.classList.add('visible');
    }

    function openPersonaEditorForEdit() {
        const preset = state.personaPresets.find(p => p.id === editingPersonaPresetId);
        if (!preset) return;
        document.getElementById('persona-editor-title').textContent = '编辑人设预设';
        document.getElementById('preset-avatar-preview').src = preset.avatar;
        document.getElementById('preset-persona-input').value = preset.persona;
        presetActionsModal.classList.remove('visible');
        personaEditorModal.classList.add('visible');
    }

    async function deletePersonaPreset() {
        const confirmed = await showCustomConfirm('删除预设', '确定要删除这个人设预设吗？此操作不可恢复。', {confirmButtonClass: 'btn-danger'});
        if (confirmed && editingPersonaPresetId) {
            await db.personaPresets.delete(editingPersonaPresetId);
            state.personaPresets = state.personaPresets.filter(p => p.id !== editingPersonaPresetId);
            hidePresetActions();
            renderPersonaLibrary();
        }
    }

    function closePersonaEditor() {
        personaEditorModal.classList.remove('visible');
        editingPersonaPresetId = null;
    }

    async function savePersonaPreset() {
        const avatar = document.getElementById('preset-avatar-preview').src;
        const persona = document.getElementById('preset-persona-input').value.trim();
        if (avatar === defaultAvatar && !persona) {
            alert("头像和人设不能都为空哦！");
            return;
        }
        if (editingPersonaPresetId) {
            const preset = state.personaPresets.find(p => p.id === editingPersonaPresetId);
            if (preset) {
                preset.avatar = avatar;
                preset.persona = persona;
                await db.personaPresets.put(preset);
            }
        } else {
            const newPreset = {id: 'preset_' + Date.now(), avatar: avatar, persona: persona};
            await db.personaPresets.add(newPreset);
            state.personaPresets.push(newPreset);
        }
        renderPersonaLibrary();
        closePersonaEditor();
    }

    const batteryAlertModal = document.getElementById('battery-alert-modal');

    function showBatteryAlert(imageUrl, text) {
        clearTimeout(batteryAlertTimeout);
        document.getElementById('battery-alert-image').src = imageUrl;
        document.getElementById('battery-alert-text').textContent = text;
        batteryAlertModal.classList.add('visible');
        const closeAlert = () => {
            batteryAlertModal.classList.remove('visible');
            batteryAlertModal.removeEventListener('click', closeAlert);
        };
        batteryAlertModal.addEventListener('click', closeAlert);
        batteryAlertTimeout = setTimeout(closeAlert, 2000);
    }

    function updateBatteryDisplay(battery) {
        const batteryContainer = document.getElementById('status-bar-battery');
        const batteryLevelEl = batteryContainer.querySelector('.battery-level');
        const batteryTextEl = batteryContainer.querySelector('.battery-text');
        const level = Math.floor(battery.level * 100);
        batteryLevelEl.style.width = `${level}%`;
        batteryTextEl.textContent = `${level}%`;
        if (battery.charging) {
            batteryContainer.classList.add('charging');
        } else {
            batteryContainer.classList.remove('charging');
        }
    }

    function handleBatteryChange(battery) {
        updateBatteryDisplay(battery);
        const level = battery.level;
        if (!battery.charging) {
            if (level <= 0.4 && lastKnownBatteryLevel > 0.4 && !alertFlags.hasShown40) {
                showBatteryAlert('https://i.postimg.cc/T2yKJ0DV/40.jpg', '有点饿了，可以去找充电器惹');
                alertFlags.hasShown40 = true;
            }
            if (level <= 0.2 && lastKnownBatteryLevel > 0.2 && !alertFlags.hasShown20) {
                showBatteryAlert('https://i.postimg.cc/qB9zbKs9/20.jpg', '赶紧的充电，要饿死了');
                alertFlags.hasShown20 = true;
            }
            if (level <= 0.1 && lastKnownBatteryLevel > 0.1 && !alertFlags.hasShown10) {
                showBatteryAlert('https://i.postimg.cc/ThMMVfW4/10.jpg', '已阵亡，还有30秒爆炸');
                alertFlags.hasShown10 = true;
            }
        }
        if (level > 0.4) alertFlags.hasShown40 = false;
        if (level > 0.2) alertFlags.hasShown20 = false;
        if (level > 0.1) alertFlags.hasShown10 = false;
        lastKnownBatteryLevel = level;
    }

    async function initBatteryManager() {
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                lastKnownBatteryLevel = battery.level;
                handleBatteryChange(battery);
                battery.addEventListener('levelchange', () => handleBatteryChange(battery));
                battery.addEventListener('chargingchange', () => {
                    handleBatteryChange(battery);
                    if (battery.charging) {
                        showBatteryAlert('https://i.postimg.cc/3NDQ0dWG/image.jpg', '窝爱泥，电量吃饱饱');
                    }
                });
            } catch (err) {
                console.error("无法获取电池信息:", err);
                document.querySelector('.battery-text').textContent = 'ᗜωᗜ';
            }
        } else {
            console.log("浏览器不支持电池状态API。");
            document.querySelector('.battery-text').textContent = 'ᗜωᗜ';
        }
    }

    async function exportData() {
        try {
            let globalSettings = await db.globalSettings.get('main') || {};
            if (!globalSettings.id) globalSettings.id = "main";
            if (!globalSettings.wallpaper) globalSettings.wallpaper = "linear-gradient(135deg, #89f7fe, #66a6ff)";

            const backupData = {
                chats: await db.chats.toArray(),
                apiConfig: await db.apiConfig.get('main') || {},
                globalSettings: globalSettings,
                userStickers: await db.userStickers.toArray(),
                worldBooks: await db.worldBooks.toArray(),
                musicLibrary: await db.musicLibrary.get('main') || {playlist: []},
                personaPresets: await db.personaPresets.toArray()
            };

            if (backupData.musicLibrary.playlist) {
                backupData.musicLibrary.playlist = backupData.musicLibrary.playlist.map(track => {
                    if (track.isLocal) {
                        return {...track, src: null, isLocal: true, requiresReupload: true};
                    }
                    return track;
                });
            }

            const jsonString = JSON.stringify(backupData);
            const dataBlob = new Blob([jsonString]);

            // Compress the data using Gzip
            const compressionStream = new CompressionStream('gzip');
            const compressedStream = dataBlob.stream().pipeThrough(compressionStream);
            const compressedBlob = await new Response(compressedStream).blob();

            const url = URL.createObjectURL(compressedBlob);
            const a = document.createElement('a');
            const now = new Date();
            const date = now.toISOString().slice(0, 10);
            const time = now.toTimeString().slice(0, 8).replace(/:/g, '');
            a.href = url;
            a.download = `EPhone_backup_${date}_${time}.phone`; // Use .phone extension
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showCustomAlert("导出成功", "所有数据已成功压缩并导出为.phone文件。");
        } catch (error) {
            console.error("导出失败:", error);
            showCustomAlert("导出失败", `发生错误: ${error.message}`);
        }
    }

    async function importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const confirmed = await showCustomConfirm(
            '确认导入',
            '警告：导入数据将覆盖当前所有聊天记录和设置。此操作不可撤销。确定要继续吗？',
            {confirmButtonClass: 'btn-danger', confirmText: '我确定，导入'}
        );

        if (!confirmed) {
            event.target.value = null;
            return;
        }

        try {
            // Decompress the file stream
            const decompressionStream = new DecompressionStream('gzip');
            const decompressedStream = file.stream().pipeThrough(decompressionStream);
            const jsonString = await new Response(decompressedStream).text();

            const backupData = JSON.parse(jsonString);

            if (!backupData.chats || !backupData.apiConfig || !backupData.globalSettings) {
                throw new Error("备份文件格式无效或已损坏。");
            }

            if (!backupData.globalSettings.id) {
                backupData.globalSettings.id = "main";
            }
            if (!backupData.globalSettings.wallpaper) {
                backupData.globalSettings.wallpaper = "linear-gradient(135deg, #89f7fe, #66a6ff)";
            }

            await db.transaction('rw', db.tables, async () => {
                await Promise.all(db.tables.map(table => table.clear()));
                if (backupData.chats && backupData.chats.length > 0) await db.chats.bulkAdd(backupData.chats);
                if (backupData.userStickers && backupData.userStickers.length > 0) await db.userStickers.bulkAdd(backupData.userStickers);
                if (backupData.worldBooks && backupData.worldBooks.length > 0) await db.worldBooks.bulkAdd(backupData.worldBooks);
                if (backupData.personaPresets && backupData.personaPresets.length > 0) await db.personaPresets.bulkAdd(backupData.personaPresets);
                await db.apiConfig.put(backupData.apiConfig);
                await db.globalSettings.put(backupData.globalSettings);
                if (backupData.musicLibrary) {
                    const playlist = backupData.musicLibrary.playlist.filter(t => !t.requiresReupload);
                    await db.musicLibrary.put({id: 'main', playlist: playlist});
                    const reuploadCount = backupData.musicLibrary.playlist.length - playlist.length;
                    if (reuploadCount > 0) {
                        showCustomAlert("部分导入", `${reuploadCount}首本地歌曲需要您重新手动添加。`);
                    }
                }
            });

            await showCustomAlert("导入成功", "数据已成功恢复。应用即将刷新。");
            window.location.reload();

        } catch (error) {
            console.error("导入失败:", error);
            await showCustomAlert("导入失败", `解压或解析文件时发生错误: ${error.message}`);
        } finally {
            event.target.value = null;
        }
    }


    async function init() {
        await loadAllDataFromDB();
        if (state.globalSettings.remoteThemeUrl) {
            switchStylesheet(state.globalSettings.remoteThemeUrl);
        }
        await updateGeolocation(); // 在初始化时获取一次位置
        updateClock();
        setInterval(updateClock, 1000 * 30);
        applyGlobalWallpaper();
        initBatteryManager();
        document.getElementById('back-to-list-btn').addEventListener('click', () => {
            exitMessageEditMode(false);
            exitSelectionMode();
            state.activeChatId = null;
            showScreen('chat-list-screen');
        });
        document.getElementById('edit-messages-btn').addEventListener('click', toggleMessageEditMode);
        document.getElementById('add-chat-btn').addEventListener('click', async () => {
            const name = await showCustomPrompt('创建新聊天', '请输入Ta的名字');
            if (name && name.trim()) {
                const newChatId = 'chat_' + Date.now();
                const newChat = {
                    id: newChatId,
                    name: name.trim(),
                    isGroup: false,
                    settings: {
                        aiPersona: '你是谁呀。',
                        myPersona: '我是谁呀。',
                        maxMemory: 10,
                        aiAvatar: defaultAvatar,
                        myAvatar: defaultAvatar,
                        background: '',
                        theme: 'default',
                        linkedWorldBookIds: [],
                        aiPatSuffix: '的脑袋瓜',
                        myPatSuffix: '的肩膀'
                    },
                    history: [],
                    musicData: {totalTime: 0}
                };
                state.chats[newChatId] = newChat;
                await db.chats.put(newChat);
                renderChatList();
            }
        });
        document.getElementById('add-group-chat-btn').addEventListener('click', async () => {
            const numStr = await showCustomPrompt('创建群聊', '请输入群成员数量 (2-20)');
            const num = parseInt(numStr);
            if (!num || num < 2 || num > 20) {
                alert('请输入2到20之间的有效数字！');
                return;
            }
            const name = await showCustomPrompt('设置群名', '请输入群聊的名字');
            if (name && name.trim()) {
                const newChatId = 'group_' + Date.now();
                const members = [];
                for (let i = 1; i <= num; i++) members.push({
                    id: `member_${Date.now()}_${i}`,
                    name: `成员${i}`,
                    avatar: defaultGroupMemberAvatar,
                    persona: '一个路过的群成员。',
                    patSuffix: '的后背'
                });
                const newGroupChat = {
                    id: newChatId,
                    name: name.trim(),
                    isGroup: true,
                    members: members,
                    settings: {
                        myPersona: '我是谁呀。',
                        myNickname: '我',
                        myPatSuffix: '的肩膀',
                        maxMemory: 10,
                        groupAvatar: defaultGroupAvatar,
                        myAvatar: defaultMyGroupAvatar,
                        background: '',
                        theme: 'default',
                        linkedWorldBookIds: []
                    },
                    history: [],
                    musicData: {totalTime: 0}
                };
                state.chats[newChatId] = newGroupChat;
                await db.chats.put(newGroupChat);
                renderChatList();
            }
        });
        document.getElementById('transfer-btn').addEventListener('click', () => document.getElementById('transfer-modal').classList.add('visible'));
        document.getElementById('transfer-cancel-btn').addEventListener('click', () => document.getElementById('transfer-modal').classList.remove('visible'));
        document.getElementById('transfer-confirm-btn').addEventListener('click', sendUserTransfer);
        document.getElementById('listen-together-btn').addEventListener('click', handleListenTogetherClick);
        document.getElementById('music-exit-btn').addEventListener('click', () => endListenTogetherSession(true));
        document.getElementById('music-return-btn').addEventListener('click', returnToChat);
        document.getElementById('music-play-pause-btn').addEventListener('click', togglePlayPause);
        document.getElementById('music-next-btn').addEventListener('click', playNext);
        document.getElementById('music-prev-btn').addEventListener('click', playPrev);
        document.getElementById('music-mode-btn').addEventListener('click', changePlayMode);
        document.getElementById('music-playlist-btn').addEventListener('click', () => {
            updatePlaylistUI();
            document.getElementById('music-playlist-panel').classList.add('visible');
        });
        document.getElementById('close-playlist-btn').addEventListener('click', () => document.getElementById('music-playlist-panel').classList.remove('visible'));
        document.getElementById('add-song-url-btn').addEventListener('click', addSongFromURL);
        document.getElementById('add-song-local-btn').addEventListener('click', () => document.getElementById('local-song-upload-input').click());
        document.getElementById('local-song-upload-input').addEventListener('change', addSongFromLocal);
        audioPlayer.addEventListener('ended', playNext);
        audioPlayer.addEventListener('pause', () => {
            if (musicState.isActive) {
                musicState.isPlaying = false;
                updatePlayerUI();
            }
        });
        audioPlayer.addEventListener('play', () => {
            if (musicState.isActive) {
                musicState.isPlaying = true;
                updatePlayerUI();
            }
        });
        const chatInput = document.getElementById('chat-input');
        document.getElementById('send-btn').addEventListener('click', async () => {
            const content = chatInput.value.trim();
            if (!content || !state.activeChatId) return;
            const chat = state.chats[state.activeChatId];
            const msg = {role: 'user', content, timestamp: Date.now()};
            chat.history.push(msg);
            await db.chats.put(chat);
            appendMessage(msg, chat);
            renderChatList();
            chatInput.value = '';
            chatInput.style.height = 'auto';
            chatInput.focus();
        });
        document.getElementById('wait-reply-btn').addEventListener('click', () => {
            triggerAiResponse();
            // 点击后自动滚动到底部
            setTimeout(() => {
                const messagesContainer = document.getElementById('chat-messages');
                if (messagesContainer) {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            }, 50);
        });
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                document.getElementById('send-btn').click();
            }
        });
        chatInput.addEventListener('input', () => {
            chatInput.style.height = 'auto';
            chatInput.style.height = (chatInput.scrollHeight) + 'px';
        });
        document.getElementById('wallpaper-upload-input').addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file) {
                const dataUrl = await new Promise((res, rej) => {
                    const reader = new FileReader();
                    reader.onload = () => res(reader.result);
                    reader.onerror = () => rej(reader.error);
                    reader.readAsDataURL(file);
                });
                newWallpaperBase64 = dataUrl;
                renderWallpaperScreen();
            }
        });
        document.getElementById('save-wallpaper-btn').addEventListener('click', async () => {
            if (newWallpaperBase64) {
                state.globalSettings.wallpaper = newWallpaperBase64;
                await db.globalSettings.put(state.globalSettings);
                applyGlobalWallpaper();
                newWallpaperBase64 = null;
                alert('壁纸已保存并应用！');
                showScreen('home-screen');
            } else alert('请先上传一张新壁纸。');
        });

        // API Settings Listeners
        document.getElementById('save-api-settings-btn').addEventListener('click', async () => {
            state.apiConfig.proxyUrl = document.getElementById('proxy-url').value.trim();
            state.apiConfig.apiKey = document.getElementById('api-key').value.trim();
            state.apiConfig.model = document.getElementById('model-select').value;
            await db.apiConfig.put(state.apiConfig);
            alert('API设置已保存!');
        });
        document.getElementById('fetch-models-btn').addEventListener('click', async () => {
            let url = document.getElementById('proxy-url').value.trim();
            const key = document.getElementById('api-key').value.trim();
            if (!url || !key) return alert('请先填写反代地址和密钥');

            // 去除/
            if (url.endsWith('/')) {
                url = url.slice(0, -1);
            }
            // 去除/v1避免 /v1/v1错误
            if (url.endsWith('/v1')) {
                url = url.slice(0, -3);
            }

            try {
                const response = await fetch(`${url}/v1/models`, {
                    headers: { 'Authorization': `Bearer ${key}` }
                });
                if (!response.ok) throw new Error('无法获取模型列表');
                const data = await response.json();
                const modelSelect = document.getElementById('model-select');
                modelSelect.innerHTML = '';
                data.data.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model.id;
                    option.textContent = model.id;
                    if (model.id === state.apiConfig.model) option.selected = true;
                    modelSelect.appendChild(option);
                });
                alert('模型列表已更新');
            } catch (error) {
                alert(`拉取模型失败: ${error.message}`);
            }
        });

        document.getElementById('geolocation-toggle').addEventListener('change', async (e) => {
            state.globalSettings.enableGeolocation = e.target.checked;
            await db.globalSettings.put(state.globalSettings);
            await updateGeolocation(); // Update location immediately on change
        });

        // World Book Listeners
        document.getElementById('add-world-book-btn').addEventListener('click', async () => {
            const name = await showCustomPrompt('创建世界书', '请输入书名');
            if (name && name.trim()) {
                const newBook = {id: 'wb_' + Date.now(), name: name.trim(), content: ''};
                await db.worldBooks.add(newBook);
                state.worldBooks.push(newBook);
                renderWorldBookScreen();
                openWorldBookEditor(newBook.id);
            }
        });
        document.getElementById('save-world-book-btn').addEventListener('click', async () => {
            if (!editingWorldBookId) return;
            const book = state.worldBooks.find(wb => wb.id === editingWorldBookId);
            if (book) {
                const newName = document.getElementById('world-book-name-input').value.trim();
                if (!newName) {
                    alert('书名不能为空！');
                    return;
                }
                book.name = newName;
                book.content = document.getElementById('world-book-content-input').value;
                await db.worldBooks.put(book);
                document.getElementById('world-book-editor-title').textContent = newName;
                editingWorldBookId = null;
                renderWorldBookScreen();
                showScreen('world-book-screen');
            }
        });
        document.getElementById('chat-messages').addEventListener('click', (e) => {
            const aiImage = e.target.closest('.ai-generated-image');
            if (aiImage) {
                const description = aiImage.dataset.description;
                if (description) showCustomAlert('照片描述', description);
                return;
            }
            const voiceMessage = e.target.closest('.voice-message-body');
            if (voiceMessage) {
                const text = voiceMessage.dataset.text;
                if (text) showCustomAlert('语音内容', text);
                return;
            }
        });
        const chatSettingsModal = document.getElementById('chat-settings-modal');
        const worldBookSelectBox = document.querySelector('.custom-multiselect .select-box');
        const worldBookCheckboxesContainer = document.getElementById('world-book-checkboxes-container');

        function updateWorldBookSelectionDisplay() {
            const checkedBoxes = worldBookCheckboxesContainer.querySelectorAll('input:checked');
            const displayText = document.querySelector('.selected-options-text');
            if (checkedBoxes.length === 0) {
                displayText.textContent = '-- 点击选择 --';
            } else if (checkedBoxes.length > 2) {
                displayText.textContent = `已选择 ${checkedBoxes.length} 项`;
            } else {
                displayText.textContent = Array.from(checkedBoxes).map(cb => cb.parentElement.textContent.trim()).join(', ');
            }
        }

        worldBookSelectBox.addEventListener('click', (e) => {
            e.stopPropagation();
            worldBookCheckboxesContainer.classList.toggle('visible');
            worldBookSelectBox.classList.toggle('expanded');
        });
        worldBookCheckboxesContainer.addEventListener('change', updateWorldBookSelectionDisplay);
        window.addEventListener('click', (e) => {
            if (!document.querySelector('.custom-multiselect').contains(e.target)) {
                worldBookCheckboxesContainer.classList.remove('visible');
                worldBookSelectBox.classList.remove('expanded');
            }
        });
        document.getElementById('chat-settings-btn').addEventListener('click', () => {
            if (!state.activeChatId) return;
            const chat = state.chats[state.activeChatId];
            const isGroup = chat.isGroup;
            document.getElementById('chat-name-group').style.display = 'block';
            document.getElementById('chat-name-input').value = chat.name;
            document.getElementById('my-persona-group').style.display = 'block';
            document.getElementById('my-persona').value = chat.settings.myPersona;
            document.getElementById('my-pat-suffix-input').value = chat.settings.myPatSuffix || '';
            document.getElementById('my-avatar-group').style.display = 'block';
            document.getElementById('my-avatar-preview').src = chat.settings.myAvatar || (isGroup ? defaultMyGroupAvatar : defaultAvatar);
            document.getElementById('my-group-nickname-group').style.display = isGroup ? 'block' : 'none';
            document.getElementById('group-avatar-group').style.display = isGroup ? 'block' : 'none';
            document.getElementById('group-members-group').style.display = isGroup ? 'block' : 'none';
            document.getElementById('ai-persona-group').style.display = isGroup ? 'none' : 'block';
            document.getElementById('ai-avatar-group').style.display = isGroup ? 'none' : 'block';
            worldBookCheckboxesContainer.innerHTML = '';
            const linkedIds = chat.settings.linkedWorldBookIds || [];
            if (state.worldBooks.length === 0) {
                worldBookCheckboxesContainer.innerHTML = '<p style="color: #888; text-align: center; margin: 10px 0;">没有可用的世界书</p>';
            } else {
                state.worldBooks.forEach(book => {
                    const isChecked = linkedIds.includes(book.id);
                    const label = document.createElement('label');
                    label.innerHTML = `<input type="checkbox" value="${book.id}" ${isChecked ? 'checked' : ''}> ${book.name}`;
                    worldBookCheckboxesContainer.appendChild(label);
                });
            }
            updateWorldBookSelectionDisplay();
            const bgPreview = document.getElementById('bg-preview');
            const removeBgBtn = document.getElementById('remove-bg-btn');
            if (chat.settings.background) {
                bgPreview.src = chat.settings.background;
                bgPreview.style.display = 'block';
                removeBgBtn.style.display = 'inline-block';
            } else {
                bgPreview.style.display = 'none';
                removeBgBtn.style.display = 'none';
            }
            if (isGroup) {
                document.getElementById('my-group-nickname-input').value = chat.settings.myNickname || '';
                document.getElementById('group-avatar-preview').src = chat.settings.groupAvatar || defaultGroupAvatar;
                renderGroupMemberSettings(chat.members);
            } else {
                document.getElementById('ai-persona').value = chat.settings.aiPersona;
                document.getElementById('ai-pat-suffix-input').value = chat.settings.aiPatSuffix || '';
                document.getElementById('ai-avatar-preview').src = chat.settings.aiAvatar || defaultAvatar;
            }
            document.getElementById('max-memory').value = chat.settings.maxMemory;
            const currentTheme = chat.settings.theme || 'default';
            const themeRadio = document.querySelector(`input[name="theme-select"][value="${currentTheme}"]`);
            if (themeRadio) themeRadio.checked = true;
            chatSettingsModal.classList.add('visible');
        });
        document.getElementById('add-group-member-btn').addEventListener('click', () => {
            if (!state.activeChatId || !state.chats[state.activeChatId].isGroup) return;
            const chat = state.chats[state.activeChatId];
            const newMember = {
                id: `member_${Date.now()}`,
                name: `新成员${chat.members.length + 1}`,
                avatar: defaultGroupMemberAvatar,
                persona: '一个新来的群成员。',
                patSuffix: '的后脑勺'
            };
            chat.members.push(newMember);
            renderGroupMemberSettings(chat.members);
        });
        document.getElementById('cancel-member-settings-btn').addEventListener('click', () => {
            document.getElementById('member-settings-modal').classList.remove('visible');
            editingMemberId = null;
        });
        document.getElementById('save-member-settings-btn').addEventListener('click', () => {
            if (!editingMemberId) return;
            const chat = state.chats[state.activeChatId];
            const member = chat.members.find(m => m.id === editingMemberId);
            member.name = document.getElementById('member-name-input').value;
            member.persona = document.getElementById('member-persona-input').value;
            member.patSuffix = document.getElementById('member-pat-suffix-input').value;
            member.avatar = document.getElementById('member-avatar-preview').src;
            renderGroupMemberSettings(chat.members);
            document.getElementById('member-settings-modal').classList.remove('visible');
        });
        document.getElementById('reset-theme-btn').addEventListener('click', () => {
            document.getElementById('theme-default').checked = true;
        });
        document.getElementById('cancel-chat-settings-btn').addEventListener('click', () => {
            chatSettingsModal.classList.remove('visible');
        });
        document.getElementById('save-chat-settings-btn').addEventListener('click', async () => {
            if (!state.activeChatId) return;
            const chat = state.chats[state.activeChatId];
            const newName = document.getElementById('chat-name-input').value.trim();
            if (!newName) return alert('备注名/群名不能为空！');
            chat.name = newName;
            const selectedThemeRadio = document.querySelector('input[name="theme-select"]:checked');
            chat.settings.theme = selectedThemeRadio ? selectedThemeRadio.value : 'default';
            chat.settings.myPersona = document.getElementById('my-persona').value;
            chat.settings.myPatSuffix = document.getElementById('my-pat-suffix-input').value;
            chat.settings.myAvatar = document.getElementById('my-avatar-preview').src;
            const checkedBooks = document.querySelectorAll('#world-book-checkboxes-container input[type="checkbox"]:checked');
            chat.settings.linkedWorldBookIds = Array.from(checkedBooks).map(cb => cb.value);
            if (chat.isGroup) {
                chat.settings.myNickname = document.getElementById('my-group-nickname-input').value.trim();
                chat.settings.groupAvatar = document.getElementById('group-avatar-preview').src;
            } else {
                chat.settings.aiPersona = document.getElementById('ai-persona').value;
                chat.settings.aiPatSuffix = document.getElementById('ai-pat-suffix-input').value;
                chat.settings.aiAvatar = document.getElementById('ai-avatar-preview').src;
            }
            chat.settings.maxMemory = parseInt(document.getElementById('max-memory').value) || 10;
            await db.chats.put(chat);
            chatSettingsModal.classList.remove('visible');
            renderChatInterface(state.activeChatId);
            renderChatList();
        });
        document.getElementById('clear-chat-btn').addEventListener('click', async () => {
            if (!state.activeChatId) return;
            const chat = state.chats[state.activeChatId];
            const confirmed = await showCustomConfirm('清空聊天记录', '此操作将永久删除此聊天的所有消息，无法恢复。确定要清空吗？', {confirmButtonClass: 'btn-danger'});
            if (confirmed) {
                chat.history = [];
                await db.chats.put(chat);
                renderChatInterface(state.activeChatId);
                renderChatList();
                chatSettingsModal.classList.remove('visible');
            }
        });
        const setupFileUpload = (inputId, callback) => {
            document.getElementById(inputId).addEventListener('change', async (event) => {
                const file = event.target.files[0];
                if (file) {
                    const dataUrl = await new Promise((res, rej) => {
                        const reader = new FileReader();
                        reader.onload = () => res(reader.result);
                        reader.onerror = () => rej(reader.error);
                        reader.readAsDataURL(file);
                    });
                    callback(dataUrl);
                    event.target.value = null;
                }
            });
        };
        setupFileUpload('ai-avatar-input', (base64) => document.getElementById('ai-avatar-preview').src = base64);
        setupFileUpload('my-avatar-input', (base64) => document.getElementById('my-avatar-preview').src = base64);
        setupFileUpload('group-avatar-input', (base64) => document.getElementById('group-avatar-preview').src = base64);
        setupFileUpload('member-avatar-input', (base64) => document.getElementById('member-avatar-preview').src = base64);
        setupFileUpload('bg-input', (base64) => {
            if (state.activeChatId) {
                state.chats[state.activeChatId].settings.background = base64;
                const bgPreview = document.getElementById('bg-preview');
                bgPreview.src = base64;
                bgPreview.style.display = 'block';
                document.getElementById('remove-bg-btn').style.display = 'inline-block';
            }
        });
        setupFileUpload('preset-avatar-input', (base64) => document.getElementById('preset-avatar-preview').src = base64);
        document.getElementById('remove-bg-btn').addEventListener('click', () => {
            if (state.activeChatId) {
                state.chats[state.activeChatId].settings.background = '';
                const bgPreview = document.getElementById('bg-preview');
                bgPreview.src = '';
                bgPreview.style.display = 'none';
                document.getElementById('remove-bg-btn').style.display = 'none';
            }
        });
        const stickerPanel = document.getElementById('sticker-panel');
        document.getElementById('open-sticker-panel-btn').addEventListener('click', () => {
            renderStickerPanel();
            stickerPanel.classList.add('visible');
        });
        document.getElementById('close-sticker-panel-btn').addEventListener('click', () => stickerPanel.classList.remove('visible'));
        document.getElementById('add-sticker-btn').addEventListener('click', async () => {
            const url = await showCustomPrompt("添加表情(URL)", "请输入表情包的图片URL");
            if (!url || !url.trim().startsWith('http')) return url && alert("请输入有效的URL (以http开头)");
            const name = await showCustomPrompt("命名表情", "请为这个表情命名 (例如：开心、疑惑)");
            if (name && name.trim()) {
                const newSticker = {id: 'sticker_' + Date.now(), url: url.trim(), name: name.trim()};
                await db.userStickers.add(newSticker);
                state.userStickers.push(newSticker);
                renderStickerPanel();
            } else if (name !== null) alert("表情名不能为空！");
        });
        document.getElementById('upload-sticker-btn').addEventListener('click', () => document.getElementById('sticker-upload-input').click());
        document.getElementById('sticker-upload-input').addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Url = reader.result;
                const name = await showCustomPrompt("命名表情", "请为这个表情命名 (例如：好耶、疑惑)");
                if (name && name.trim()) {
                    const newSticker = {id: 'sticker_' + Date.now(), url: base64Url, name: name.trim()};
                    await db.userStickers.add(newSticker);
                    state.userStickers.push(newSticker);
                    renderStickerPanel();
                } else if (name !== null) alert("表情名不能为空！");
            };
            event.target.value = null;
        });
        document.getElementById('upload-image-btn').addEventListener('click', () => document.getElementById('image-upload-input').click());
        document.getElementById('image-upload-input').addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file || !state.activeChatId) return;
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Url = e.target.result;
                const chat = state.chats[state.activeChatId];
                const msg = {
                    role: 'user',
                    content: [{type: 'image_url', image_url: {url: base64Url}}],
                    timestamp: Date.now()
                };
                chat.history.push(msg);
                await db.chats.put(chat);
                appendMessage(msg, chat);
                renderChatList();
            };
            reader.readAsDataURL(file);
            event.target.value = null;
        });
        document.getElementById('voice-message-btn').addEventListener('click', async () => {
            if (!state.activeChatId) return;
            const text = await showCustomPrompt("发送语音", "请输入你想说的内容：");
            if (text && text.trim()) {
                const chat = state.chats[state.activeChatId];
                const msg = {role: 'user', type: 'voice_message', content: text.trim(), timestamp: Date.now()};
                chat.history.push(msg);
                await db.chats.put(chat);
                appendMessage(msg, chat);
                renderChatList();
            }
        });
        document.getElementById('send-photo-btn').addEventListener('click', async () => {
            if (!state.activeChatId) return;
            const description = await showCustomPrompt("发送照片", "请用文字描述您要发送的照片：");
            if (description && description.trim()) {
                const chat = state.chats[state.activeChatId];
                const msg = {role: 'user', type: 'user_photo', content: description.trim(), timestamp: Date.now()};
                chat.history.push(msg);
                await db.chats.put(chat);
                appendMessage(msg, chat);
                renderChatList();
            }
        });
        document.getElementById('open-persona-library-btn').addEventListener('click', openPersonaLibrary);
        document.getElementById('close-persona-library-btn').addEventListener('click', closePersonaLibrary);
        document.getElementById('add-persona-preset-btn').addEventListener('click', openPersonaEditorForCreate);
        document.getElementById('cancel-persona-editor-btn').addEventListener('click', closePersonaEditor);
        document.getElementById('save-persona-preset-btn').addEventListener('click', savePersonaPreset);
        document.getElementById('preset-action-edit').addEventListener('click', openPersonaEditorForEdit);
        document.getElementById('preset-action-delete').addEventListener('click', deletePersonaPreset);
        document.getElementById('preset-action-cancel').addEventListener('click', hidePresetActions);
        document.getElementById('selection-cancel-btn').addEventListener('click', exitSelectionMode);
        document.getElementById('selection-delete-btn').addEventListener('click', async () => {
            if (selectedMessages.size === 0) return;
            const confirmed = await showCustomConfirm('删除消息', `确定要删除选中的 ${selectedMessages.size} 条消息吗？`, {confirmButtonClass: 'btn-danger'});
            if (confirmed) {
                const chat = state.chats[state.activeChatId];
                chat.history = chat.history.filter(msg => !selectedMessages.has(msg.timestamp));
                await db.chats.put(chat);
                renderChatInterface(state.activeChatId);
                renderChatList();
            }
        });

        document.getElementById('export-data-btn').addEventListener('click', exportData);
        document.getElementById('import-data-trigger-btn').addEventListener('click', () => document.getElementById('import-data-input').click());
        document.getElementById('import-data-input').addEventListener('change', importData);
        //预设管理
        document.getElementById('add-preset-btn').addEventListener('click', () => openPresetEditor(null));
        document.getElementById('save-preset-btn').addEventListener('click', savePreset);
        document.getElementById('delete-preset-btn').addEventListener('click', deletePreset);

        document.getElementById('preset-list').addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-preset-btn');
            const setActiveBtn = e.target.closest('.set-active-preset-btn');
            if (editBtn) {
                openPresetEditor(editBtn.dataset.presetId);
            } else if (setActiveBtn && !setActiveBtn.disabled) {
                setActivePreset(setActiveBtn.dataset.presetId);
            }
        });

        document.getElementById('restore-preset-defaults-btn').addEventListener('click', async () => {
            const confirmed = await showCustomConfirm('恢复默认值', '确定要将当前编辑的所有提示词恢复为系统默认值吗？');
            if(confirmed){
                document.getElementById('prompt-image-input').value = DEFAULT_PROMPT_IMAGE;
                document.getElementById('prompt-voice-input').value = DEFAULT_PROMPT_VOICE;
                document.getElementById('prompt-transfer-input').value = DEFAULT_PROMPT_TRANSFER;
                document.getElementById('prompt-single-input').value = DEFAULT_PROMPT_SINGLE;
                document.getElementById('prompt-group-input').value = DEFAULT_PROMPT_GROUP;
            }
        });
        //远程css
        // --- 主题与外观 ---
        // 按钮：选择内置主题
        document.getElementById('open-builtin-themes-btn').addEventListener('click', () => {
            const builtinThemeListUrl = './themeList.json';
            openThemeListModal(builtinThemeListUrl, '选择内置主题');
        });

        // 按钮：加载远程主题库
        document.getElementById('load-remote-library-btn').addEventListener('click', () => {
            const libraryUrl = document.getElementById('remote-theme-library-url').value.trim();
            if (!libraryUrl) {
                alert('请输入远程主题库的URL！');
                return;
            }
            openThemeListModal(libraryUrl, '选择远程主题');
        });
        // 按钮：应用远程CSS URL
        document.getElementById('apply-remote-theme-btn').addEventListener('click', async () => {
            const url = document.getElementById('remote-theme-url').value.trim();
            if (!url) {
                alert('请输入远程主题的CSS URL！');
                return;
            }
            switchStylesheet(url);
            state.globalSettings.remoteThemeUrl = url;
            await db.globalSettings.put(state.globalSettings);
            showCustomAlert("主题已更新", "远程主题已应用并保存。");
        });
        // 按钮：重置为默认主题
        document.getElementById('reset-remote-theme-btn').addEventListener('click', async () => {
            document.getElementById('remote-theme-url').value = '';
            document.getElementById('remote-theme-library-url').value = '';
            switchStylesheet(''); // Revert to default
            state.globalSettings.remoteThemeUrl = '';
            await db.globalSettings.put(state.globalSettings);
            showCustomAlert("主题已重置", "已恢复为默认主题。");
        });
        // 主题选择弹窗内的按钮
        document.getElementById('cancel-theme-selection-btn').addEventListener('click', closeThemeListModal);
        document.getElementById('confirm-theme-selection-btn').addEventListener('click', confirmThemeSelection);
        showScreen('home-screen');
    }

    init();
});
