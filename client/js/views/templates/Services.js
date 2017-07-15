module.exports = () =>
`<div>
    <h1>Our Services</h1>
    <div class="intro">
        <div>
            <p>The Wizard spent countless hours in various school basements to learn the science of computing.  He toiled for various companies in all sorts of different scenarios. In the digital realm, there is little he cannot do.  Below you can find a list of common solutions, but he'll be happy to chat with you about any sort of problem, free of charge.</p>
            <p>The Wizard and his team have got you covered!</p>
        </div>
        <div>${require('./lib/wizard')}</div>
    </div>
    <div class="border"></div>
    <div class="categories">
        <div>
            <h3>General Tech Support</h3>
            <ul>
                <li>Mac and PC. Laptop, desktop, mobile, and tablet. Tell us your problem and we'll fix it!</li>
            </ul>
        </div>
        <div>
            <h3>Internet Service Advice</h3>
            <ul>
                <li>We'll take a look at where you live and let you know what your best options are for connecting
                to the internet</li>
            </ul>
        </div>
    </div>
    <div class="categories">
        <div>
            <h3>Data Recovery and Backups</h3>
            <ul>
                <li>Hard drive crash? We'll help you get your valuable data back</li>
                <li>And we'll help you back your data up so that it's safe for the future</li>
            </ul>
        </div>
        <div>
            <h3>Networks</h3>
            <ul>
                <li>Installation of wired and wireless networks</li>
                <li>Troubleshooting for internet connection issues</li>
                <li>Configuration of modems, routers, printers, mobile hotspots</li>
            </ul>
        </div>
    </div>
    <div class="categories">
        <div>
            <h3>Computer Security</h3>
            <ul>
                <li>Keep your kids safe from inappropriate content</li>
                <li>Find and eliminate viruses, malware, and spyware</li>
                <li>Set up antivirus software and firewalls for further protection</li>
            </ul>
       </div>
        <div>
            <h3>Help for Businesses</h3>
            <ul>
                <li>Fully customizable websites that will improve your brand and optimize your workflow</li>
                <li>Email, Hosting, Content Management, Payment processing, Digitization</li>
                <li>Image recognition software</li>
                <li>You name it!</li>
            </ul>
        </div>
    </div>
</div>`
