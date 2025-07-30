'use strict';

// מגדירים את מודול הניהול של התוסף בשם 'admin/plugins/anonymous-plugin'
// תלות ב־Settings (לטעינה/שמירה) ו־alerts (להצגת התראות)
define('admin/plugins/anon-profile', ['settings', 'alerts'], function (Settings, alerts) {

    const AnonymousProfile = {};
    // הפונקציה שתופעל כאשר נכנסים לדף הניהול של התוסף
    AnonymousProfile.init = function () {
        // כאשר הדף נטען – נטען קודם את כל הנתונים (קבוצות + הגדרות) מ־API

        Settings.load('anon-profile', $('.anon-profile-settings'), function (err, settings) {
            if (err) {
                settings = {};
            }

            var defaults = {
                minReputation: 10,
                allowedGroups: ['administrators']
            };

            // Set defaults
            for (var setting in defaults) {
                if (!settings.hasOwnProperty(setting)) {
                    if (typeof defaults[setting] === 'boolean') {
                        $('#' + setting).prop('checked', defaults[setting]);

                    } else {
                        $('#' + setting).val(defaults[setting]);
                    }
                }
                console.log(setting);
            }
        });

        $('#save').on('click', function () {
            Settings.save('anon-profile', $('.anon-profile-settings'), function () {
                alerts.alert({
                    type: 'success',
                    alert_id: 'anon-profile-saved',
                    title: 'ההגדרות נשמרו',
                    message: '',
                    timeout: 5000,
                });
            });
        });
    };


    return AnonymousProfile;
});
