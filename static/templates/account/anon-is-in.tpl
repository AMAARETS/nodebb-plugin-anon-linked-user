<!-- IMPORT partials/account/header.tpl -->

<style>
    /* מיכל כרטיס מותאם אישית במרכז הדף */
    .card-custom-anon {
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      padding: 32px;
      margin-top: 2rem;
      text-align: center;
    }

    /* כותרת ראשית בכרטיס */
    .card-custom-anon h1 {
      margin-top: 0;
      font-size: 1.75rem;
      font-weight: 600;
      color: #2a5d84;
    }

    /* טקסט תיאורי בכרטיס */
    .card-custom-anon p {
      margin: 16px 0;
      line-height: 1.6;
      font-size: 1.1rem;
      color: #555;
    }

    /* עיצוב ייחודי לתצוגת שם המשתמש (זה החלק שהיה חסר לך) */
    .username-kayam {
      display: inline-block;
      background-color: #e1f0fb;
      color: #1a4f73;
      padding: 10px 20px;
      border-radius: 25px;
      font-weight: bold;
      font-size: 1.2rem;
      margin-top: 10px;
    }
</style>

<div class="row">
    <div class="col-md-8 offset-md-2">
        <div class="card-custom-anon">
            {{{ if (anonOrReg == "reg") }}}
                <h1>כבר קיים לך פרופיל אישי</h1>
                <p>כבר יצרת בעבר משתמש אישי בפורום.</p>
                    <p>למעבר לעריכת המשתמש האישי שלך:</p>
                <div class="username-kayam">
                    <a id="user-switch-button" class="dropdown-item rounded-1 d-flex align-items-center gap-2" href="#" role="menuitem">
			            {buildAvatar(user2, "20px", true)}
			            <span>{user2.username}</span>
		            </a>

                </div>
            {{{ end }}}

            {{{ if (anonOrReg == "anon") }}}
                <h1>כבר קיים לך פרופיל עסקי</h1>
                <p>כבר יצרת בעבר משתמש עסקי בפורום.</p>
                <p>למעבר לעריכת המשתמש העסקי שלך:</p>
                <div class="username-kayam">
                    <a id="user-switch-button" class="dropdown-item rounded-1 d-flex align-items-center gap-2" href="#" role="menuitem">
			            {buildAvatar(user2, "20px", true)}
			            <span>{user2.username}</span>
		            </a>

                </div>
            {{{ end }}}
        </div>
    </div>
</div>

<!-- IMPORT partials/account/footer.tpl -->