'use strict';
require(['hooks', 'jquery', 'app', 'alerts'], function (hooks, $, app, alerts) {


    $(document).on('click', '#user-switch-button', async function (event) {
        // 1. מנע את הפעולה הדיפולטיבית של הקישור (ניווט)
        event.preventDefault();
        try {
            const response = await fetch('/api/plugins/anon-profile/swich-user');
            if (!response.ok) {
                throw new Error('Failed to fetch switch user');
            };
            const data = await response.json();
            if (data.allowed) {
                alerts.alert({
                    type: 'success',
                    title: 'ההחלפה הצליחה',
                    message: 'הדף יטען מחדש בעוד רגע...',
                    timeout: 1500,
                });
                setTimeout(() => {
                    // 1. הגדר את הביטוי הרגולרי
                    // הביטוי שלך מצוין, הוא תופס גם נתיבים כמו /user/slug וגם /user/slug/posts
                    const userProfileRegex = /^\/user\/([^\/]+)(\/.*)?$/;

                    // 2. בצע התאמה מול הנתיב הנוכחי
                    const currentPath = window.location.pathname;
                    const match = currentPath.match(userProfileRegex);

                    // ▼▼▼ התיקון הקריטי מתחיל כאן ▼▼▼

                    // 3. בדוק אם הייתה התאמה (כלומר, match אינו null)
                    if (match) {
                        // אם אנחנו כאן, אנחנו יודעים בביטחון שאנחנו בדף משתמש
                        // ושאפשר לגשת ל-match[1]

                        // 4. פענח את הסלוג מה-URL
                        const slugFromUrl = decodeURIComponent(match[1]);

                        // 5. בצע את ההשוואה הבטוחה
                        if (slugFromUrl === data.userslug) {
                            // אנחנו נמצאים בדף של המשתמש שהרגע הוחלף.
                            // נווט לדף של המשתמש השני עם רענון מלא.
                            const destinationSlug = encodeURIComponent(data.userslug2);
                            const destinationUrl = `/user/${destinationSlug}`;
                            window.location.href = destinationUrl;
                        } else {
                            // אנחנו נמצאים בדף משתמש, אבל לא של המשתמש שהוחלף.
                            // במקרה כזה, פשוט נרענן את הדף הנוכחי.
                            window.location.reload();
                        }
                    } else {
                        // 6. אם אין התאמה ל-Regex כלל (אנחנו בדף הבית, recent, וכו')
                        // פשוט בצע רענון של הדף הנוכחי.
                        window.location.reload();
                    }
                    // ▲▲▲ התיקון מסתיים כאן ▲▲▲

                }, 1500);                //setTimeout(() => window.location.reload(), 1500);
            } else {
                alerts.alert({
                    type: 'danger',
                    title: 'שגיאה',
                    message: 'נכשל ניסיון החלפת משתמש <br> ניתן להחליף ידנית או לנסות שוב מאוחר יותר.',
                    timeout: 2000,
                });

            }
        } catch (err) {
            console.error('Failed to send switch user request:', err);
            alerts.alert({ type: 'danger', title: 'שגיאה', message: 'נכשל ניסיון החלפת משתמש. <br> ניתן להחליף ידנית או לנסות שוב מאוחר יותר.', timeout: 2000, });
        }
    });

    hooks.on('action:composer.loaded', function (data) {
        // 'data.composerEl' הוא אובייקט jQuery של הקומפוזר שזה עתה נטען.
        // זה מבטיח שאנחנו עובדים רק על הקומפוזר הנכון.
        //console.log('deta:', data);
        const $composer = data.composerEl;

        // מצא את האלמנט הבעייתי בתוך הקומפוזר הספציפי הזה
        const $heightContainer = $composer.find('.p-2.d-flex.flex-column.gap-1.h-100');

        // אם האלמנט נמצא...
        if ($heightContainer.length) {
            //console.log('ffffffffffff')
            // הסר את הקלאס הבעייתי שדורש 100% גובה
            $heightContainer.removeClass('h-100');

            // קבע את הגובה ל'auto'. זה יאפשר לאלמנט להתאים את עצמו
            // לתוכן שבו, ויפתור את בעיית ההתנפחות.
            $heightContainer.css('height', 'auto');
        }
        //return data;
    });


    hooks.on('filter:composer.create', async function (data) {
        try {

            const response = await fetch('/api/plugins/anon-profile/data'); // <-- השתמש באותה כתובת שהגדרת ב-plugin.json

            if (!response.ok) {
            // זורקים שגיאה כדי לעבור לבלוק ה-catch
                throw new Error('Failed to fetch anon profile data');
            };


        // (2) ממתינים לפענוח ה-JSON
            const apiData = await response.json();
            data.createData.privileges.anon = apiData.allowedUser;
            data.createData.anonIsin = apiData.anonIsin;
            data.createData.isAnon = apiData.isAnon;
            data.createData.nameRegular = apiData.nameRegular;
            data.createData.nameAnon = apiData.nameAnon;
            data.createData.userAnon = apiData.userAnon;
            data.createData.userReg = apiData.userReg;
            data.createData.anonDefault = apiData.anonDefault;
            //console.log(data);

        
    
        } catch (error) {

            // אם משהו נכשל בדרך, נדפיס שגיאה לקונסול
            console.error('Error fetching plugin data:', error);
            return data;

        }        

        //data.createData.user = app.user
        return data;
        
        
    });
    hooks.on('action:composer.submit', function (data) {

        //console.log('data:', data);

        // 1. מצא את כפתור הרדיו המסומן עם השם 'anon' בכל הדף
        //const $selectedOption = $('input[name="anon"]:checked');

        // משתנה שיחזיק את הבחירה של המשתמש
        let postType = 'regular'; // ערך ברירת מחדל למקרה שלא נמצאה בחירה

        // 2. בדוק אם נמצא כפתור מסומן
        //if ($selectedOption.length > 0) {
        // 3. קרא את הערך שלו ('anon' או 'regular') והכנס למשתנה
        const $anon = data.composerEl.find('input[name="anon"]:checked');
        if ($anon.length) {
            postType = $anon.val(); //$selectedOption.val();
        };
        //}
        //console.log('sssssssss',$selectedOption.val())
        //console.log('סוג הפוסט שנבחר:', postType);

        // 4. הוסף את הערך לנתונים שיישלחו לשרת
        // כאן, נשתמש ישירות במחרוזת שקיבלנו

        data.composerData.regOrAnon = postType;
    });

    function fixComposerHeight() {
        // מצא את כל הקומפוזרים הפתוחים בדף
        const composers = document.querySelectorAll('div[component="composer"]');

        composers.forEach(composer => {
            // בתוך כל קומפוזר, מצא את האלמנט הספציפי שאחראי על הגובה
            const heightContainer = composer.querySelector('.p-2.d-flex.flex-column.gap-1.h-100');

            // ודא שהאלמנט נמצא ושהוא עדיין עם הקלאס h-100 (כדי לא לדרוס שינויים אחרים)
            if (heightContainer && heightContainer.classList.contains('h-100')) {
                // הסר את הקלאס h-100 שדורש 100% גובה
                heightContainer.classList.remove('h-100');

                // קבע גובה מפורש באמצעות style. 
                // 10% זה מעט מדי, ערך כמו 'auto' או חישוב דינמי יהיה טוב יותר.
                // נתחיל עם 'auto' שיתאים את עצמו לתוכן.
                heightContainer.style.height = 'auto';

                // אם תרצה בכל זאת אחוזים, תצטרך לוודא שלאב יש גובה מוגדר.
                // לדוגמה, אם האב הוא 400px, 10% יהיו 40px בלבד.
                // heightContainer.style.height = '10%'; // אפשרות פחות מומלצת

                //console.log('Composer height fixed for:', composer);
            }
        });
    };
});