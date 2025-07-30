<div class="acp-page-container">
    <!-- IMPORT admin/partials/settings/header.tpl -->
	<div class="row m-0">
		<div id="spy-container" class="col-12 col-md-8 px-0 mb-4" tabindex="0">
      <form class="form anon-profile-settings">
        <div class="form-group">
          <label class="col-sm-4 control-label">קבוצות מורשות</label>
          <div class="col-sm-7" id="groups-container">
		    <div class="mb-3">
			    <label class="form-label" for="allowedGroups">בחר את הקבוצות המורשות ליצירת פרופיל אנונימי</label>
                    <p>ניתן לבחור כמה קבוצות ע"י החזקת מקש קונטרול לחוץ תוך כדי בחירה</p>
			        <select class="form-select" id="allowedGroups" name="allowedGroups" multiple>
					    <!-- BEGIN groups -->
						    <option value="{groups.displayName}">{groups.displayName}</option>
					    <!-- END groups -->
				    </select>
		    </div>
          </div>
        </div>

        <div class="form-group">
          <label class="col-sm-4 control-label">מוניטין מינימלי</label>
          <div class="col-sm-7">
            <input
              type="number"
              name="minReputation"
              class="form-control"
              id="minReputation-input"
              value="0"
              min="0" 
            >
          </div>
        </div>
      </form>
      </div>
    <!-- IMPORT admin/partials/settings/toc.tpl -->
    </div>
</div>

