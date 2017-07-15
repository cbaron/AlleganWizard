module.exports = () =>
`<div>
    <div class="info">
        <div>
            <h2>Interested in a better Internet service?</h2>
            <p>For most folks living in the rural parts of southwestern Michigan, finding a decent home internet service can be bafflingly difficult. For The Wizard, this is a very important matter.  In today's world, everyone needs a reliable, affordable access to the Internet.  The technology is available and I want to make it happen.  If you have any interest in a reasonably priced, unlimited internet service with a customer focused approach, please fill out the form below, and I will be in touch.</p>
        </div>
        <div></div>
    </div>
    <div class="border"></div>
    <div class="form">
        <form>
            <input data-js="name" type="text" placeholder="Name">
            <input data-js="contact" type="text" placeholder="Email or Phone Number">
            <input data-js="address" type="text" placeholder="Address">
            <button data-js="submitBtn" type="button">Submit</button>
        </form>
        <div>${require('./lib/wizard')}</div>
    </div>
</div>`
