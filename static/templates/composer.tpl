<div component="composer" class="composer {{{ if resizable }}} resizable{{{ end }}}{{{ if !isTopicOrMain }}} reply{{{ end }}}">
	<div class="composer-container d-flex flex-column gap-1 h-100">
		<!-- mobile header -->
		<nav class="navbar fixed-top mobile-navbar hidden-md hidden-lg text-bg-primary flex-nowrap gap-1 px-1">
			<div class="btn-group">
				<button class="btn btn-sm btn-primary composer-discard" data-action="discard" tabindex="-1"><i class="fa fa-fw fa-times"></i></button>
				<button class="btn btn-sm btn-primary composer-minimize" data-action="minimize" tabindex="-1"><i class="fa fa-fw fa-minus"></i></button>
			</div>
			{{{ if isTopic }}}
			<div class="category-name-container">
				<span class="category-name"></span> <i class="fa fa-sort"></i>
			</div>
			{{{ end }}}
			{{{ if !isTopicOrMain }}}
			<h4 class="title text-bg-primary">{{{ if isEditing }}}[[topic:composer.editing-in, "{topicTitle}"]]{{{ else }}}[[topic:composer.replying-to, "{topicTitle}"]]{{{ end }}}</h4>
			{{{ end }}}
			<div class="display-scheduler p-2 {{{ if !canSchedule }}} hidden{{{ end }}}">
				<i class="fa fa-clock-o"></i>
			</div>
			{{{ if (privileges.anon && (anonIsin || isAnon)) }}}
				<style>
					.actions-container-mobile {
						border: 1px solid #eaf5ff;
						background-color: #85c1e9;
						padding: 4px;
						border-radius: 6px;
						display: flex;
						justify-content: space-between;
						align-items: center;
					}					
					.actions-container-mobile .form-check-input {
						position: absolute;
						opacity: 0;
						width: 0;
						height: 0;
					}
					.actions-container-mobile .visual-box {
						cursor: pointer;
						border: 1px solid #dee2e6; 
						border-radius: 4px;
						transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
						width: 34px;
						height: 34px;
						padding: 0 !important;
						justify-content: center;
					}
					.actions-container-mobile label:hover .visual-box {
						background-color: #d4eaff;
						border-color: #a3d1f7;
					}
					.actions-container-mobile input:checked + .visual-box {
						background-color: #cce4ff;
						border-color: #0d6efd;
					}
					.actions-container-mobile input:checked + .visual-box:hover {
						background-color: #cce4ff; 
						border-color: #0d6efd;  
					}
				</style>
				<div class="actions-container-mobile">
					<div class="composer-actions-wrapper d-flex align-items-center">
						<div class="anon-options-container d-flex align-items-center gap-1">
								<label class="form-check-label fw-bold mb-0" for="anonymous-radio1-mobile" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="tooltip-custom" title="פרסם בשם המשתמש הרגיל שלך">
									<input class="form-check-input mt-0" type="radio" name="anon" value="anon" id="anonymous-radio1-mobile" {{{ if (anonDefault == "anon") }}} checked {{{ end }}}>
        
									<span class="visual-box d-inline-flex align-items-center gap-1 px-2 py-0.5">
										{buildAvatar(userAnon, "20px", true)}
									</span>
								</label>
    
								<label class="form-check-label fw-bold mb-0" for="anonymous-radio2-mobile" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="tooltip-custom" title="פרסם בשם המשתמש העסקי שלך">
									<input class="form-check-input mt-0" type="radio" name="anon" value="regular" id="anonymous-radio2-mobile" {{{ if (anonDefault == "reg") }}} checked {{{ end }}}>
        
									<span class="visual-box d-inline-flex align-items-center gap-1 px-2 py-0.5">
										{buildAvatar(userReg, "20px", true)}
									</span>
								</label>
							<i class="fa-solid fa-circle-info text-muted" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="tooltip-custom" title="יש לבחור אם לפרסם את התגובה תחת שם המשתמש הרגיל שלך, או תחת שם העסק. הבחירה נשמרת לפעמים הבאות"></i>
						</div>
					</div>
				
					<div class="btn-group">
						<button class="btn btn-sm btn-primary composer-submit" data-action="post" tabindex="-1"><i class="fa fa-fw fa-chevron-right"></i></button>
					</div>
				</div>
			{{{ else }}}
			<div class="btn-group">
				<button class="btn btn-sm btn-primary composer-submit" data-action="post" tabindex="-1"><i class="fa fa-fw fa-chevron-right"></i></button>
			</div>
			{{{ end }}}
		</nav>
		<div class="p-2 d-flex flex-column gap-1 h-10">
			<!-- IMPORT partials/composer-title-container.tpl -->

			<!-- IMPORT partials/composer-formatting.tpl -->

			<!-- IMPORT partials/composer-write-preview.tpl -->

			{{{ if isTopicOrMain }}}
			<!-- IMPORT partials/composer-tags.tpl -->
			{{{ end }}}

			<div class="imagedrop"><div>[[topic:composer.drag-and-drop-images]]</div></div>

			<div class="resizer position-absolute w-100 bottom-100 pe-3 border-bottom">
				<div class="trigger text-center">
					<div class="handle d-inline-block px-2 py-1 border bg-body">
						<i class="fa fa-fw fa-up-down"></i>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
