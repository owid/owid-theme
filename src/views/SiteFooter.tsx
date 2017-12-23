import * as React from 'react'

export const SiteFooter = () => {
    return <footer id="colophon" className="site-footer">
        <div className="wrap">
            <div className="clearfix">
                <div className="column">
                    <p>Our World in Data is an online publication that presents the empirical evidence on the development of human living conditions at a global scale.</p>
                    <br />
                    <a rel="license" href="https://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" src="data:image/png;base64,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" /></a>
                    <p><span>Our World in Data</span> by <a href="https://maxroser.com" property="cc:attributionName" rel="cc:attributionURL">Max Roser</a> is licensed under a <a rel="license" href="https://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>. See <a href="https://ourworldindata.org/how-to-use-our-world-in-data/">how to use Our World in Data</a>.</p>
                    <hr />
                </div>
            </div>
            <div className="column subscribe">
                <h6>Sign up to stay informed</h6>
                <div id="mc_embed_signup">
                    <form action="https://ourworldindata.us8.list-manage.com/subscribe/post?u=18058af086319ba6afad752ec&id=2e166c1fc1" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" target="_blank" noValidate>
                        <div id="mc_embed_signup_scroll">
                            <div className="mc-field-group">
                                <input type="email" placeholder="Email" name="EMAIL" className="required email" id="mce-EMAIL" aria-label="Email" /><input type="submit" placeholder="Subscribe" name="subscribe" id="mc-embedded-subscribe" className="button" />
                            </div>
                            <div id="mce-responses" className="clear">
                                <div className="response" id="mce-error-response" style={{ display: 'none' }} />
                                <div className="response" id="mce-success-response" style={{ display: 'none' }} />
                            </div>
                            <div style={{ position: 'absolute', left: '-5000px' }}><input type="text" name="b_18058af086319ba6afad752ec_2e166c1fc1" tabIndex={-1} /></div>
                        </div>
                    </form>
                </div>
                <h6>Follow us</h6>
                <div className="social">
                    <a href="https://twitter.com/MaxCRoser"><i className="fa fa-twitter" /></a>
                    <a href="https://www.facebook.com/OurWorldinData"><i className="fa fa-facebook" /></a>
                    <a href="/feed/"><i className="fa fa-feed" /></a>
                </div>
                <hr />
            </div>
            <div className="column links">
                <h6>Links</h6>
                <a href="/">Entries</a>
                <a href="/blog">Blog</a>
                <a href="/support">Donate</a>
                <a href="/about">About</a>
                <hr />
            </div>
        </div>
        <div className="supporters">
            <p><strong>We are supported by the <a href="/support">generous donations of readers</a>. Without these donations our work would not be possible. Thank you!</strong></p>
            <hr />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '4%' }}>
                <div style={{ maxWidth: '45%', marginRight: 10 }}>
                    <a className="oms-logo" href="https://www.oxfordmartin.ox.ac.uk/"><img style={{ maxHeight: 180 }} src="/wp-content/themes/owid-theme/images/oxford-martin-school.png" alt="Oxford Martin School logo" /></a>
                </div>
                <div style={{ maxWidth: '45%', marginLeft: 10 }}>
                    <a className="inet-logo" href="https://www.inet.ox.ac.uk/"><img src="/wp-content/themes/owid-theme/images/inet-oxford.png" alt="INET Oxford logo" /></a>
                </div>
            </div>
        </div>
    </footer>
}