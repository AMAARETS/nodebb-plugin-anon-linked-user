<!-- IMPORT partials/account/header.tpl -->
{{{ if (privOrBus == "business")}}}
    <h2 class="tracking-tight fw-semibold text-center">הוספת פרופיל אישי</h2>
{{{ else }}}
    <h2 class="tracking-tight fw-semibold text-center">הוספת פרופיל עסקי</h2>
{{{ end }}}

<div class="row justify-content-center gap-5">
    <div class="col-12 col-md-5 col-lg-3 px-md-0">
        <div class="register-block">
            <form component="register/local" class="d-flex flex-column gap-3" role="form" action="{config.relative_path}/register" method="post">

                <div class="mb-2 d-flex flex-column gap-2">
                    <label for="username">
                        {{{ if (privOrBus == "business")}}}הכנס שם משתמש לפרופיל האישי{{{ else }}}הכנס שם משתמש לפרופיל העסקי{{{ end }}}
                    </label>
                    <div class="d-flex flex-column">
                        <input class="form-control" type="text" placeholder="{{{ if (privOrBus == "business")}}}שם משתמש אישי{{{ else }}}שם משתמש עסקי{{{ end }}}" name="username" id="username" autocorrect="off" autocapitalize="off" autocomplete="nickname" aria-required="true" aria-describedby="username-notify"/>
                        <span class="register-feedback text-xs text-danger" id="username-notify" aria-live="polite"></span>
                        <span class="form-text text-xs">
                            שם משתמש ייחודי בין {minimumUsernameLength} ל {maximumUsernameLength} תווים. משתמשים אחרים יכולים לציין את השם {{{ if (privOrBus == "business")}}}האישי{{{ else }}}העסקי{{{ end }}} שלכם באמצעות @<span id='yourUsername'>שם המשתמש שלכם</span>
                        </span>
                    </div>
                </div>

                <div class="mb-2 d-flex flex-column gap-2">
                    <label for="password">
                        {{{ if (privOrBus == "business")}}}סיסמה (ניתן לבחור בסיסמה הרגילה שלך, או באחרת){{{ else }}}סיסמה (ניתן לבחור באותה הסיסמה של הפרופיל השני שלך, או באחרת){{{ end }}}
                    </label>
                    <div class="d-flex flex-column">
                        <input class="form-control" type="password" placeholder="{{{ if (privOrBus == "business")}}}הקלד סיסמה לפרופיל האישי{{{ else }}}הקלד סיסמה לפרופיל העסקי{{{ end }}}" name="password" id="password" autocomplete="new-password" autocapitalize="off" aria-required="true" aria-describedby="password-notify"/>
                        <span class="register-feedback text-xs text-danger" id="password-notify" aria-live="polite"></span>
                        <span class="form-text text-xs">הסיסמה חייבת להיות לפחות באורך של {minimumPasswordLength} תווים</span>
                        <p id="caps-lock-warning" class="text-danger hidden">
                            <i class="fa fa-exclamation-triangle"></i> [[login:caps-lock-enabled]]
                        </p>
                    </div>
                </div>

                <div class="mb-2 d-flex flex-column gap-2">
                    <label for="password-confirm">אימות סיסמה</label>
                    <div>
                        <input class="form-control" type="password" placeholder="הקלד שנית את הסיסמה" name="password-confirm" id="password-confirm" autocomplete="new-password" autocapitalize="off" aria-required="true" aria-describedby="password-confirm-notify"/>
                        <span class="register-feedback text-xs text-danger" id="password-confirm-notify" aria-live="polite"></span>
                    </div>
                </div>
                
                {{{ if (privOrBus == "business") }}}
                    <input type="hidden" name="isAnon" value="true"/>
                    <input type="hidden" name="uidR" value="{{loggedInUser.uid}}"/>
                    <input type="hidden" name="typeProfile" value="private">
                {{{ else }}}
                    <input type="hidden" name="anonIsin" value="true"/>
                    <input type="hidden" name="uidA" value="{{loggedInUser.uid}}"/>
                    <input type="hidden" name="typeProfile" value="business">
                {{{ end }}}

                {{{ each regFormEntry }}}
                <div class="mb-2 regFormEntry d-flex flex-column gap-2 {./styleName}">
                    <label for="{./inputId}">{./label}</label>
                    <div>{{./html}}</div>
                </div>
                {{{ end }}}
                
                <button class="btn btn-primary" id="register" type="submit">
                    {{{ if (privOrBus == "business")}}}הוסף עכשיו את הפרופיל האישי שלך{{{ else }}}הוסף עכשיו את הפרופיל העסקי שלך{{{ end }}}
                </button>

                <div class="alert alert-danger{{{ if !error }}} hidden{{{ end }}}" id="register-error-notify" role="alert" aria-atomic="true">
                    <strong>[[error:registration-error]]</strong>
                    <p class="mb-0">{error}</p>
                </div>

                <hr/>
                
                <input id="token" type="hidden" name="token" value="" />
                <input id="noscript" type="hidden" name="noscript" value="true" />
                <input type="hidden" name="_csrf" value="{config.csrf_token}" />

            </form>
        </div>
    </div>
</div>
<!-- IMPORT partials/account/footer.tpl -->