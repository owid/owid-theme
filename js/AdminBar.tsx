import * as React from 'react'

const AdminBar = () => {
    return <div id="wpadminbar">
        <div className="quicklinks" id="wp-toolbar" role="navigation" aria-label="Toolbar">
            <ul id="wp-admin-bar-root-default" className="ab-top-menu">
                <li id="wp-admin-bar-site-name" className="menupop">
                    <a className="ab-item" aria-haspopup="true" href="/wp-admin/">Our World In Data</a>
                </li>
                <li id="wp-admin-bar-edit"><a className="ab-item" href="/wp-admin/post.php?post=<?php echo(the_ID()) ?>&#038;action=edit">Edit Page</a></li>
            </ul>
        </div>
    </div>
}

<script>
if (document.cookie.indexOf('wordpress') != -1 || document.cookie.indexOf('wp-settings') != -1) {
    $('#wpadminbar').show();
}
</script>
