'use strict';

const Groups = require.main.require('./src/groups');   // מודול לשליפת קבוצות
const Settings = require.main.require('./src/settings'); // מודול לשליפת ושמירת הגדרות
const db = require.main.require('./src/database');
const User = require.main.require('./src/user');
const Posts = require.main.require('./src/posts');
const authentication = require.main.require('./src/controllers/authentication')
const userController = require.main.require('./src/controllers/user')
const meta = require.main.require('./src/meta');
const winston = require.main.require('winston');


const plugin = { };

plugin.init = function (params, callback) {
    const { router, middleware } = params;
    const hostMiddleware = params.middleware;
    const hostHelpers = require.main.require('./src/routes/helpers');
    const accountMiddlewares = [
        middleware.exposeUid,
        middleware.ensureLoggedIn,
        middleware.canViewUsers,
        middleware.checkAccountPermissions,
        middleware.buildAccountData,
    ];

    //console.log("א")
    var app = params.router,
        //middleware = params.middleware,
        controllers = params.controllers;

    //app.get('/admin/plugins/anon-profile', middleware.admin.buildHeader, renderAdmin);
    app.get('/api/plugins/anon-profile/data', renderApiData);
    app.get('/api/plugins/anon-profile/swich-user', renderSwichUser);
    //console.log("ב")
    //app.get('/admin/anon-profile/data', middleware.ensureLoggedIn, middleware.admin.checkPrivileges, getData);
    //console.log("ג")
    //app.get('/api/user/:user/anon-profile', renderAnonProfile);
    hostHelpers.setupAdminPageRoute(router, '/admin/plugins/anon-profile', [hostMiddleware.pluginHooks], renderAdmin);
    hostHelpers.setupPageRoute(router, '/user/:userslug/anon-profile', accountMiddlewares, renderAnonProfile);
    //app.get('/user/:userslug/anon-profile', accountMiddlewares, renderAnonProfile);
    //hostHelpers.setupPageRoute(router, '/user/:userslug/2factor', accountMiddlewares, renderAnonProfile);

    //console.log("ד")
        callback();
};
plugin.addAdminNavigation = function (header, callback) {
    header.plugins.push({
        route: '/plugins/anon-profile',
        icon: 'fa-tint',
        name: 'פרופיל אנונימי'
    });
    callback(null, header);
};

plugin.addProfileLink = async function (menuData) {
    // דוחפים אובייקט קישור חדש למערך
    //const _self = plugin;
    //_self.config = _self.config || {};

    const defaults = {
        minReputation: '10',
        allowedGroups: ['administrators']
    };

    // 3. טוענים את ההגדרות מעודכנות לפני כל פעולה
    const options = await meta.settings.get('anon-profile')

    // 4. ממזגים defaults עם מה שקיבלנו מה־DB
    const config = Object.assign({}, defaults, options);

    // 5. אם allowedGroups עדיין מחרוזת – הופכים למערך
    //if (typeof config.allowedGroups === 'string') {
    //    config.allowedGroups = config.allowedGroups.split(',').map(s => s.trim());
    //};

    if (typeof config.allowedGroups === 'string') {
        try {
            // 1.1. מנסה לפרסר את המחרוזת כ-JSON
            //       לדוגמה: input = '["אורחים", "administrators"]'
            const arr = JSON.parse(config.allowedGroups);
            // 1.2. חוזר עם המערך המפורסם
            config.allowedGroups = arr;
        } catch (err) {
            // 1.3. אם הייתה שגיאה בפרסינג, מפליט לוג ומחזיר מערך ריק
            console.error('שגיאה בפרסינג מחרוזת JSON:', err);
        }
    }

    const uid = menuData.callerUID;
    //console.log('uid', uid);
    const repUid = await User.getUserField(uid, 'reputation');
    const repUidInt = parseInt(repUid, 10) || 0;
    const isMembers = await Groups.isMemberOfGroups(uid, config.allowedGroups);
    const allowUid = isMembers.some(Boolean);
    const privOrBus = await User.getUserField(uid, 'typeProfile');
    //console.log('config', config);
    //console.log('isMember', isMembers);
    //console.log('alowUid', allowUid);
    //console.log('repuid',repUid);
    if (repUidInt >= parseInt(config.minReputation, 10) && allowUid) {
        menuData.links.push({
            id: 'anon-profile',    // מזהה ייחודי של הקישור
            route: 'anon-profile',              // נתיב יחסי, יוביל ל־/user/:userslug/custom
            icon: 'fa-link',              // אייקון FontAwesome להצגה
            name: (privOrBus === "business") ? 'פרופיל אישי' : 'פרופיל עסקי', // הטקסט שיוצג בתפריט
            visibility: {
                self: true,
                other: false,
                moderator: false,
                globalMod: false,
                admin: false,
                canViewInfo: false,
            },
        });
    }
    // ממשיכים לבצע את שאר ההוקים (אין שינויים נוספים)
        return menuData;

};

plugin.addFieldProfile = async function (data) {
    if (data && data.templateData) {
        // 2. בדיקה שהקוד רץ בהקשר הנכון (עמוד פרופיל)
        //    data.templateData.uid הוא מזהה טוב לכך שאנחנו בדף פרופיל.
        if (data.templateData.uid) {
            //console.log('Running on profile page for uid:', data.templateData.uid);
            const isAdmin = data.templateData.isAdmin;
            if (isAdmin) {
                // 3. אתחול המערך רק אם הוא לא קיים כדי למנוע דריסה
                if (!data.templateData.customUserFields) {
                    data.templateData.customUserFields = [];
                }
                if (data.templateData.isAnon) {
                    let userSlug = await User.getUserField(data.templateData.uidR, 'userslug');
                    let userName = await User.getUserField(data.templateData.uidR, 'username');
                    data.templateData.customUserFields.push({
                        name: "פרופיל מקושר - עסקי",
                        value: `/user/${encodeURIComponent(userSlug)}`,
                        linkValue: userName,
                        icon: "fa fa-user",
                        type: "input-link"
                    });

                } else if (data.templateData.anonIsin) {
                    let userSlug = await User.getUserField(data.templateData.uidA, 'userslug');
                    let userName = await User.getUserField(data.templateData.uidA, 'username');
                    data.templateData.customUserFields.push({
                        name: "פרופיל מקושר - פרטי",
                        value: `/user/${encodeURIComponent(userSlug)}`,
                        linkValue: userName,
                        icon: "fa fa-user",
                        type: "input-link"
                    });

                }
            }
        }
    }

    // תמיד קרא ל-callback כדי שהפורום ימשיך לעבוד
    return data;
};


plugin.addFields = async function (user, data) {
    //console.log("User");
    //console.log(User);
    //console.log("אגגגגגגגגגגגגגגגגגגגגגג");
    //console.log(data);
    //console.log(user);
    if (user.data.isAnon !== undefined) {
        const promises = [
            User.setUserField(user.user.uid, 'isAnon', true),
            User.setUserField(user.user.uid, 'uidR', user.data.uidR),
            User.setUserField(user.caller.uid, 'uidR', user.data.uidR),
            User.setUserField(user.caller.uid, 'uidA', user.user.uid),
            User.setUserField(user.user.uid, 'uidA', user.user.uid),
            User.setUserField(user.caller.uid, 'anonIsin', true),
            User.setUserField(user.user.uid, 'email:confirmed', true)
        ];

        await Promise.all(promises); // כל הפעולות רצות במקביל

        //סנכרון מוניטין
        const rep = await User.getUserField(user.caller.uid, 'reputation');
        await User.setUserField(user.user.uid, 'reputation', rep);
        //סנכרון הגדרות
        const settings = await User.getSettings(user.caller.uid);
        //console.log('settings:', settings);
        await User.saveSettings(user.user.uid, settings);

        //סנכרון קבוצות
        const userGroupsData = await Groups.getUserGroups([user.caller.uid]);
        const groupNames = userGroupsData.flatMap(groupArray => groupArray.map(group => group.name));
        //console.log('groupNames:', groupNames);
        if (groupNames.length) {

            // שלב 3: הוספת המשתמש החדש לכל קבוצה
            // אנו משתמשים ב-Promise.all כדי לבצע את כל בקשות ההצטרפות במקביל לשיפור ביצועים.
            await Groups.join(groupNames, user.user.uid)

            //console.log('groupNames:',groupNames);
            //Groups.join(gr, user.user.uid);
        }
    } else if (user.data.anonIsin !== undefined) {
        const promises = [
            User.setUserField(user.user.uid, 'isAnon', true),
            User.setUserField(user.user.uid, 'uidR', user.data.uidR),
            User.setUserField(user.caller.uid, 'uidR', user.data.uidR),
            User.setUserField(user.caller.uid, 'uidA', user.user.uid),
            User.setUserField(user.user.uid, 'uidA', user.user.uid),
            User.setUserField(user.caller.uid, 'anonIsin', true),
            User.setUserField(user.user.uid, 'email:confirmed', true)
        ];

        await Promise.all(promises); // כל הפעולות רצות במקביל

        //סנכרון מוניטין
        const rep = await User.getUserField(user.caller.uid, 'reputation');
        await User.setUserField(user.user.uid, 'reputation', rep);
        //סנכרון הגדרות
        const settings = await User.getSettings(user.caller.uid);
        //console.log('settings:', settings);
        await User.saveSettings(user.user.uid, settings);

        //סנכרון קבוצות
        const userGroupsData = await Groups.getUserGroups([user.caller.uid]);
        const groupNames = userGroupsData.flatMap(groupArray => groupArray.map(group => group.name));
        //console.log('groupNames:', groupNames);
        if (groupNames.length) {

            // שלב 3: הוספת המשתמש החדש לכל קבוצה
            // אנו משתמשים ב-Promise.all כדי לבצע את כל בקשות ההצטרפות במקביל לשיפור ביצועים.
            await Groups.join(groupNames, user.user.uid)

            //console.log('groupNames:',groupNames);
            //Groups.join(gr, user.user.uid);
        }

    };
};
plugin.addUserFieldWhite = async({ uids, whitelist }) => {
    whitelist.push('isAnon');
    whitelist.push('uidR');
    whitelist.push('uidA');
    whitelist.push('anonIsin');
    whitelist.push('anonDefault');
    whitelist.push('reputation');

    return { uids, whitelist };
};
plugin.checkRepUpDown = async function (data) {
    const voterUid = parseInt(data.uid, 10);
    const ownerUid = parseInt(data.owner, 10);
    const pid = data.pid;

    const isOwnerAnon = await User.getUserField(ownerUid, 'isAnon');
    const isOwnerAnonIsin = await User.getUserField(ownerUid, 'anonIsin');

    let linkedUidOfOwner = null;
    if (isOwnerAnon) {
        linkedUidOfOwner = await User.getUserField(ownerUid, 'uidR');
    } else if (isOwnerAnonIsin) {
        linkedUidOfOwner = await User.getUserField(ownerUid, 'uidA');
    }

    if (linkedUidOfOwner && parseInt(linkedUidOfOwner, 10) === voterUid) {
        // Posts.unvote תבטל כל סוג של הצבעה (בעד או נגד) שקיימת כרגע
        // ותתקן את המוניטין באופן אוטומטי.
        console.log(`[Plugin] Undoing forbidden vote. Voter: ${voterUid}, Owner: ${ownerUid}`);
        await Posts.unvote(pid, voterUid);
        return data;
    }
    await syncRep(data,linkedUidOfOwner,isOwnerAnon,isOwnerAnonIsin);
    return data;
};

plugin.checkRepUn = async function (data) {
    const ownerUid = parseInt(data.owner, 10);
    const isOwnerAnon = await User.getUserField(ownerUid, 'isAnon');
    const isOwnerAnonIsin = await User.getUserField(ownerUid, 'anonIsin');

    let linkedUidOfOwner = null;
    if (isOwnerAnon) {
        linkedUidOfOwner = await User.getUserField(ownerUid, 'uidR');
    } else if (isOwnerAnonIsin) {
        linkedUidOfOwner = await User.getUserField(ownerUid, 'uidA');
    }

    await syncRep(data, linkedUidOfOwner, isOwnerAnon, isOwnerAnonIsin);
    return data;
};

async function syncRep(data, linkedUid, isAnon, anonIsin) {
    //console.log('data.current:', data.current);
    //return data;
    const owner = data.owner;
    //console.log('isAnon:',isAnon,'anonIsin:',anonIsin, 'owner:',owner)
    if (isAnon || anonIsin) {
        const rep = await User.getUserField(owner, 'reputation');
        await User.setUserField(linkedUid, 'reputation', rep);
    }
};

plugin.checkRep = async function (data) {
    console.log('datahhhhh:',data)
    const owner = data.owner;
    const isAnon = await User.getUserField(owner, 'isAnon');
    const anonIsin = await User.getUserField(owner, 'anonIsin');
    //console.log('isAnon:',isAnon,'anonIsin:',anonIsin, 'owner:',owner)
    if (isAnon) {
        let uid = data.uid
        const uidR = await User.getUserField(owner, 'uidR');
        if (uid === uidR) {
            console.log('uidR:')
            throw new Error('[[error:self-vote]]');
        }
    } else if (anonIsin) {
        let uid = data.uid
        const uidA = await User.getUserField(owner, 'uidA');
        if (uid === uidA) {
            console.log('uidA:')

            throw new Error('[[error:self-vote]]');
        }
    }
    return data;
}

plugin.onUserJoinedGroup = async function (data) {
    //console.log('data:', data);
    const uid = data.uid;
    const groupNames = data.groupNames;
    const isAnon = await User.getUserField(uid, 'isAnon');
    const anonIsin = await User.getUserField(uid, 'anonIsin');
    if (isAnon) {
        const uidR = await User.getUserField(uid, 'uidR');
        Groups.join(groupNames, uidR)
    } else if (anonIsin) {
        const uidA = await User.getUserField(uid, 'uidA');
        Groups.join(groupNames, uidA)
    }

}

plugin.onUserLeavedGroup = async function (data) {
    //console.log('data:', data);
    const uid = data.uid;
    const groupNames = data.groupNames;
    const isAnon = await User.getUserField(uid, 'isAnon');
    const anonIsin = await User.getUserField(uid, 'anonIsin');
    if (isAnon) {
        const uidR = await User.getUserField(uid, 'uidR');
        Groups.leave(groupNames, uidR)
    } else if (anonIsin) {
        const uidA = await User.getUserField(uid, 'uidA');
        Groups.leave(groupNames, uidA)

    }

}

plugin.syncSettings = async function (data) {
    try {
        const sourceUid = data.uid;
        const settingsToSync = data.settings;

        // נשלוף את הנתונים הרלוונטיים על המשתמש המקורי
        const [isAnon, anonIsin] = await Promise.all([
            User.getUserField(sourceUid, 'isAnon'),
            User.getUserField(sourceUid, 'anonIsin'),
        ]);

        let targetUid;
        if (isAnon) {
            targetUid = await User.getUserField(sourceUid, 'uidR');
        } else if (anonIsin) {
            targetUid = await User.getUserField(sourceUid, 'uidA');
        }

        // אם לא נמצא משתמש מקושר, אין מה לסנכרן
        if (!targetUid) {
            return;
        }

        // קבל את ההגדרות הנוכחיות של משתמש היעד
        const targetCurrentSettings = await User.getSettings(targetUid);

        // השוואה חכמה: נמיר את שני אובייקטי ההגדרות למחרוזות JSON ונשווה ביניהן.
        // זוהי דרך פשוטה ויעילה לבדוק אם כל הערכים זהים.
        if (JSON.stringify(settingsToSync) === JSON.stringify(targetCurrentSettings)) {
            // אם ההגדרות זהות, אין צורך לבצע שמירה. כך נמנעת לולאה אינסופית.
            return;
        }

        // ההגדרות שונות, ולכן נבצע את הסנכרון.
        // קריאה זו תפעיל את ההוק מחדש עבור משתמש היעד, אבל בריצה הבאה,
        // הבדיקה שלמעלה תגלה שההגדרות זהות ותעצור את הלולאה.
        await User.saveSettings(targetUid, settingsToSync);

    } catch (err) {
        winston.error(`[plugin-anonymous-alt] אירעה שגיאה בסנכרון הגדרות עבור משתמש ${data.uid}: ${err.message}`);
    }
};


plugin.addMyButtonToNavigation = async function (data) {
    // המידע כבר קיים, אין צורך בקריאות DB חדשות!
    const currentUser = data.templateValues.user;

    if (currentUser && currentUser.uid) {
        let targetUid;
        if (currentUser.isAnon === 'true' || currentUser.isAnon === true) { // השוואה בטוחה
            targetUid = currentUser.uidR;
        } else if (currentUser.anonIsin === 'true' || currentUser.anonIsin === true) {
            targetUid = currentUser.uidA;
        }

        if (targetUid) {
            const fieldsToGet = ['uid', 'picture', 'icon:bgColor', 'icon:text', 'username', 'userslug'];
            // זו הקריאה היחידה למסד הנתונים, ורק אם יש צורך
            const targetUsers = await User.getUsersFields([targetUid], fieldsToGet);
            if (targetUsers.length > 0) {
                data.templateValues.user2 = targetUsers[0];
                data.templateValues.regOrAnon = true;
            }
        }
    }

    return data;
};

plugin.checkRegister = function (params, callback) {
    //console.log(",,,,,,,,,,,,");
    callback(null, params);
};

plugin.onTopicCreate = async function (post) {
    console.log('פוסט:', post);
    return post;
    const isAnon = await User.getUserField(post.caller.uid, 'isAnon');
    const anonIsin = await User.getUserField(post.caller.uid, 'anonIsin');
    const reg = await User.getUserField(post.caller.uid, 'uidR');
    const an = await User.getUserField(post.caller.uid, 'uidA');
    //console.log('post.data.regOrAnon:', post.data.regOrAnon)
    //console.log('isAnon', isAnon)
    //console.log('anonIsin', anonIsin)
    if (isAnon) {
        if (post.data.regOrAnon === 'regular') {
            post.post.uid = reg;
            await User.setUserField(post.caller.uid, 'anonDefault', 'reg');
            await User.setUserField(reg, 'anonDefault', 'reg');
        } else {
            await User.setUserField(post.caller.uid, 'anonDefault', 'anon');
            await User.setUserField(reg, 'anonDefault', 'anon');
        }
    } else if (anonIsin){
        if (post.data.regOrAnon === 'anon') {
            post.post.uid = an;
            await User.setUserField(post.caller.uid, 'anonDefault', 'anon');
            await User.setUserField(an, 'anonDefault', 'anon');
        } else {
            await User.setUserField(post.caller.uid, 'anonDefault', 'reg');
            await User.setUserField(an, 'anonDefault', 'reg');
        }
    }    
    return post;
};

plugin.onPostCreate = async function (post) {
    //console.log('פוסט:', post);
    const isAnon = await User.getUserField(post.caller.uid, 'isAnon');
    const anonIsin = await User.getUserField(post.caller.uid, 'anonIsin');
    const reg = await User.getUserField(post.caller.uid, 'uidR');
    const an = await User.getUserField(post.caller.uid, 'uidA');
    //console.log('post.data.regOrAnon:', post.data.regOrAnon)
    //console.log('isAnon', isAnon)
    //console.log('anonIsin', anonIsin)
    if (isAnon) {
        if (post.data.regOrAnon === 'regular') {
            post.post.uid = reg;
            await User.setUserField(post.caller.uid, 'anonDefault', 'reg');
            await User.setUserField(reg, 'anonDefault', 'reg');
        } else {
            await User.setUserField(post.caller.uid, 'anonDefault', 'anon');
            await User.setUserField(reg, 'anonDefault', 'anon');
        }
    } else if (anonIsin){
        if (post.data.regOrAnon === 'anon') {
            post.post.uid = an;
            await User.setUserField(post.caller.uid, 'anonDefault', 'anon');
            await User.setUserField(an, 'anonDefault', 'anon');
        } else {
            await User.setUserField(post.caller.uid, 'anonDefault', 'reg');
            await User.setUserField(an, 'anonDefault', 'reg');
        }
    }    
    return post;
};


plugin.onUserLoggedIn = function (uid) {
    //console.log(uid);
};
plugin.logTemplateName = function (hookData, callback) {
    // בודק אם שם התבנית קיים
    //console.log(hookData.relative_path);
    //console.log("kkkkkk");
    if (hookData.template) {
        // מדפיס לקונסול את שם התבנית
        //console.log(`שם התבנית: ${hookData.template}`);
    }
    // ממשיך לעיבוד הבא
    callback(null, hookData);
};
plugin.addBtn = function (params, callback) {
    //onsole.log('sss', params)
    callback(null, params);
    // 🟢 שדה נוסף: סוג משתתמש
    const toogleAnon = {
        html: `<style>.action-bar>.composer-discard{order:0!important}.action-bar>.composer-toggle{order:1!important}.action-bar>.btn-group.btn-group-sm{order:2!important}</style><button type="button" class="btn btn-sm btn-outline-secondary composer-toggle" data-bs-toggle="button" aria-pressed="false" autocomplete="off" onclick="this.classList.toggle('active'); this.setAttribute('aria-pressed', this.classList.contains('active'))"><i class="fa fa-toggle-on"></i> <span class="d-none d-md-inline">Toggle</span></button>`
    };

    // 🧩 הוספת השדות לתוך הטופס
    if (params.templateData.regFormEntry && Array.isArray(params.templateData.regFormEntry)) {
        params.templateData.regFormEntry.push(toogleAnon);
    }

    callback(null, params);
};


function saveCustomFieldCallback(uid, fieldName, fieldValue) {
    // uid: מזהה המשתמש
    // fieldName: שם השדה שרוצים לשמור
    // fieldValue: הערך לשמירה (מחרוזת, מספר וכדומה)

    // יוצרים אובייקט עם המפתח ושוויו
    const dataObject = {};
    dataObject[fieldName] = fieldValue;

    // קוראים לפונקציה ומעבירים callback שיקבל (err, result)
    User.setUserFields(uid, dataObject, function (err) {
        if (err) {
            // טיפול בשגיאה במידה והייתה
            console.error(`שגיאה בשמירת השדה ${fieldName} למשתמש ${uid}:`, err);
            return;
        };
        //console.log(`הערך של השדה "${fieldName}" נשמר בהצלחה עבור המשתמש ${uid}`);
    });
};
async function renderAdmin(req, res, next) {
    try {
        const groupData = await Groups.getGroupsFromSet('groups:visible:createtime', 0, -1);
        const allGroups = await Groups.getNonPrivilegeGroups('groups:createtime', 0, -1);
        //console.log('groups', allGroups);
        res.render('admin/plugins/anon-profile', {
            groups: allGroups,
            title: 'פרופיל אנונימי',
            //groups: allGroups,  // כל הקבוצות (gid + name)
            //settings: settings    // ההגדרות השמורות (allowedGroups מחרוזת, minReputation מספר)
            }
        );
    } catch (err) {
        return next(err);
    };
};

async function renderSwichUser(req, res, next) {
    const uid = req.uid;
    //console.log('רק:', req);
    //console.log('רס:', res);
    if (!uid) {
        return res.json({ allowwed: false });
    };

    const isAnon = await User.getUserField(uid, 'isAnon');
    const anonIsin = await User.getUserField(uid, 'anonIsin');
    const userslug = await User.getUserField(uid, 'userslug');
    //console.log('isAnon:', isAnon, 'anonIsin:', anonIsin, 'uid:', uid)
    if (isAnon) {
        const uidR = await User.getUserField(uid, 'uidR');
        const userslug2 = await User.getUserField(uidR, 'userslug');
        await authentication.doLogin(req, uidR);
        return res.json({ allowed: true, userslug: userslug, userslug2: userslug2 });

    } else if (anonIsin) {
        const uidA = await User.getUserField(uid, 'uidA');
        const userslug2 = await User.getUserField(uidA, 'userslug');
        await authentication.doLogin(req, uidA);
        return res.json({ allowed: true, userslug: userslug, userslug2: userslug2 });
    }
    return res.json({ allowed: false });   
}

async function renderApiData(req, res, next) {
    try {
        const uid = req.uid;

        if (!uid) {
            return res.json({ allowedUser: false , anonIsin: false, nameRegular: null, nameAnon: null});
        };


        //const anonIsin = await User.getUserField(uid, 'anonIsin');
        const defaults = {
            minReputation: '10',
            allowedGroups: ['administrators']
        };

        // 3. טוענים את ההגדרות מעודכנות לפני כל פעולה
        const options = await meta.settings.get('anon-profile')

        // 4. ממזגים defaults עם מה שקיבלנו מה־DB
        const config = Object.assign({}, defaults, options);

        if (typeof config.allowedGroups === 'string') {
            try {
                // 1.1. מנסה לפרסר את המחרוזת כ-JSON
                //       לדוגמה: input = '["אורחים", "administrators"]'
                const arr = JSON.parse(config.allowedGroups);
                // 1.2. חוזר עם המערך המפורסם
                config.allowedGroups = arr;
            } catch (err) {
                // 1.3. אם הייתה שגיאה בפרסינג, מפליט לוג ומחזיר מערך ריק
                console.error('שגיאה בפרסינג מחרוזת JSON:', err);
            }
        }
        //console.log('req', req);
        //console.log('uid', uid);
        const repUid = await User.getUserField(uid, 'reputation');
        const repUidInt = parseInt(repUid, 10) || 0;
        const isMembers = await Groups.isMemberOfGroups(uid, config.allowedGroups);
        const allowUid = isMembers.some(Boolean);
        const allow = repUidInt >= parseInt(config.minReputation, 10) && allowUid;
        const anonIsin = await User.getUserField(uid, 'anonIsin');
        const isAnon = await User.getUserField(uid, 'isAnon');
        const uidR = await User.getUserField(uid, 'uidR');
        const uidA = await User.getUserField(uid, 'uidA');
        const nameAnon = await User.getUserField(uidA, 'username');
        const nameRegular = await User.getUserField(uidR, 'username');
        const fieldsToGet = ['uid', 'picture', 'icon:bgColor', 'icon:text', 'username', 'userslug'];
        const userAnon = await User.getUsersFields([uidA], fieldsToGet);
        const userReg = await User.getUsersFields([uidR], fieldsToGet);
        const anonDefault = await User.getUserField(uid, 'anonDefault');

        res.json({
            allowedUser: allow,
            anonIsin: anonIsin,
            isAnon: isAnon,
            nameAnon: nameAnon,
            nameRegular:nameRegular,
            userAnon: userAnon[0],
            userReg: userReg[0],
            anonDefault: anonDefault
        });
    } catch (err) {
        return next(err);
    };

};
function getData(req, res, next) {
    try {
        // נטען את כל הקבוצות
        const allGroups1 = db.getSortedSetRevRange('groups:createtime', 0, -1);
        //console.log(allGroups1)
        fetchGroupNames().then(allGroups => {


            // נטען את כל ההגדרות (אובייקט, או {} אם לא קיים עדיין)
            const settingsWrapper = new Settings('anon-profile-setings', '1.0.0', {
                allowedGroups: '',
                minReputation: 0,
            }, async function () {
                const settings = settingsWrapper.cfg._;

                console.log("ה")
                // נרכיב מערך allowedGroups_asArray מתוך המחרוזת (אם קיימת)
                let allowedArray = [];
                if (settings.allowedGroups) {
                    allowedArray = settings.allowedGroups
                        .split(',')
                        .map(item => item.trim())
                        .filter(item => item.length);
                }

                // נענה JSON שמכיל: כל הקבוצות + מערך של הגדרות
                res.json({
                    groups: allGroups,            // [{ gid: "1", name: "Administrators" }, …]
                    settings: {
                        allowedGroups: allowedArray, // [ "3", "5", … ]
                        minReputation: settings.minReputation || 0
                    }
                });
            });
        });
    } catch (err) {
        return next(err);
    }
    next(null, res);
};


async function renderAnonProfile(req, res)  {
    try {


        const uid = req.uid;
        if (!uid) {
            res.render('account/noAllowed', { title: 'הגישה נדחתה', });
        };

        //const anonIsin = await User.getUserField(uid, 'anonIsin');
        const defaults = {
            minReputation: '10',
            allowedGroups: ['administrators']
        };

        // 3. טוענים את ההגדרות מעודכנות לפני כל פעולה
        const options = await meta.settings.get('anon-profile')

        // 4. ממזגים defaults עם מה שקיבלנו מה־DB
        const config = Object.assign({}, defaults, options);

        if (typeof config.allowedGroups === 'string') {
            try {
                // 1.1. מנסה לפרסר את המחרוזת כ-JSON
                //       לדוגמה: input = '["אורחים", "administrators"]'
                const arr = JSON.parse(config.allowedGroups);
                // 1.2. חוזר עם המערך המפורסם
                config.allowedGroups = arr;
            } catch (err) {
                // 1.3. אם הייתה שגיאה בפרסינג, מפליט לוג ומחזיר מערך ריק
                console.error('שגיאה בפרסינג מחרוזת JSON:', err);
            }
        }
        //console.log('req', req);
        //console.log('uid', uid);
        const repUid = await User.getUserField(uid, 'reputation');
        const repUidInt = parseInt(repUid, 10) || 0;
        const isMembers = await Groups.isMemberOfGroups(uid, config.allowedGroups);
        const allowUid = isMembers.some(Boolean);
        const allow = repUidInt >= parseInt(config.minReputation, 10) && allowUid;
        const uidR = await User.getUserField(uid, 'uidR');
        const uidA = await User.getUserField(uid, 'uidA');
        const anonIsin = await User.getUserField(uid, 'anonIsin');
        const isAnon = await User.getUserField(uid, 'isAnon');
        const nameAnon = await User.getUserField(uidA, 'username');
        const nameRegular = await User.getUserField(uidR, 'username');
        const slugAnon = await User.getUserField(uidA, 'userslug');
        const slugRegular = await User.getUserField(uidR, 'userslug');

        //console.log('config', config);
        //console.log('isMember', isMembers);
        //console.log('alowUid', allowUid);
        //console.log('repuid', repUid);


        if ((anonIsin || isAnon) && allow) {
            const anonOrReg = (anonIsin) ? 'reg' : 'anon';
            const uid2 = (isAnon) ? uidR : uidA;
            const fieldsToGet = ['uid', 'picture', 'icon:bgColor', 'icon:text', 'username', 'userslug'];
            const user2 = await User.getUsersFields([uid2], fieldsToGet);
            //console.log('anonOrReg:', anonOrReg)
            res.render('account/anon-is-in', { user2:user2[0], nameAnon: nameAnon, nameRegular: nameRegular, anonOrReg: anonOrReg, slugAnon:slugAnon, slugRegular:slugRegular, ...res.locals.userData, title: 'פרופיל עסקי/אישי', });
        } else if (allow) {
            const privOrBus = await User.getUserField(uid, 'typeProfile');
            res.render('account/anonymous-create', { privOrBus: privOrBus, ...res.locals.userData, title: 'פרופיל עסקי/אישי', });
        } else {
            res.render('account/noAllowed', { title: 'הגישה נדחתה', });
        };
    } catch (err) {
        //console.log('erore:', err)

    }
};

module.exports = plugin;

