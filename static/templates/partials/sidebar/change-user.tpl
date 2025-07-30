<a component="header/avatar" id="user_dropdown" href="#" role="button" class="nav-link d-flex gap-2 align-items-center text-truncate" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" aria-label="[[user:user-menu]]">
	{buildAvatar(user2, "20px", true)}
	<span id="user-header-name" class="nav-text small visible-open fw-semibold">{user2.username}</span>
</a>

<ul id="user-control-list" component="header/usercontrol" class="overscroll-behavior-contain user-dropdown dropdown-menu shadow p-1 text-sm ff-base" role="menu">
	<li>
		<a class="dropdown-item rounded-1 d-flex align-items-center gap-2" href="{relative_path}/user/{user2.userslug}" role="menuitem">
			<i class="fa fa-fw fa-user text-secondary"></i>
			<span>{user2.username}</span>
		</a>
	</li>
	<li>
		<a id="user-switch-button" class="dropdown-item rounded-1 d-flex align-items-center gap-2" href="#" role="menuitem">
			<i class="fa fa-fw fa-exchange text-secondary"></i>
			<span>החלף משתמש</span>
		</a>
	</li>
</ul>