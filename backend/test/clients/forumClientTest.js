var chai = require('chai')
chai.use(require('chai-as-promised'))
var sinon = require('sinon')
var axios = require('axios')
var should = chai.should()
var expect = chai.expect

var client = require('../../clients/forum_client')


describe("Forum Client", function() {
    let sandbox
    const validToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NTA0NjM2NjAsImV4cCI6MTY1MDQ2MzY2MCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoiYXJndXMrbWExX3VzZXIxQGhpZ2h3YXl0aHJlZXNvbHV0aW9ucy5jb20iLCJHaXZlbk5hbWUiOiJNZXRhZGF0YSIsIlN1cm5hbWUiOiJBcHByb3Zlcl8xX1VzZXJfMSIsIkVtYWlsIjoiYXJndXMrbWExX3VzZXIxQGhpZ2h3YXl0aHJlZXNvbHV0aW9ucy5jb20iLCJHcm91cHMiOlsiZXhwb3J0ZXIiLCJtZXRhZGF0YV9hcHByb3Zlcl8xX2RpcCJdfQ.ESqoLyihlc-lbfXrzfGaxYa9RWLb6lXmqcs1bghyzas"

    before(async () => {
        sandbox = sinon.createSandbox();
        sandbox.stub(axios, 'get').returns({data: [{_id:"00",name:"someperm"}]})
        sandbox.stub(axios, 'post').returns({data: {_id:"111"}})
    })
    after(async () => {
        sandbox.restore()
    })

    it('should succeed adding a topic without organization', async function () {
        const topic = await client.addTopic("myname", {})
        expect(topic).to.be.an('object')
        expect(topic._id).equals('111')
    })

    it('should succeed adding a topic with organization', async function () {
        const topic = await client.addTopic("myname", {organization: 'myorg', jwt: validToken, groups: []})
        expect(topic).to.be.an('object')
        expect(topic._id).equals('111')
    })

    it('should succeed adding a comment', async function () {
        const topic = await client.addComment("topic_id", "my comment", {organization: 'myorg', jwt: validToken, groups: []})
        expect(topic).to.be.an('object')
        expect(topic.data._id).equals('111')
    })

    it('should succeed getting comments', async function () {
        const topic = await client.getComments("topic_id", {organization: 'myorg', jwt: validToken, groups: []})
        expect(topic).to.be.an('array')
        expect(topic[0]._id).equals('00')
    })

})