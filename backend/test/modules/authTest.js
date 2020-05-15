var chai = require('chai');
var config = require('config');
var should = chai.should();
var expect = chai.expect;

const auth = require('../../modules/auth')

describe("Auth Module", function() {
    it('should succeed as valid token', function (done) {
        const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NTA0NjM2NjAsImV4cCI6MTY1MDQ2MzY2MCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoiYXJndXMrbWExX3VzZXIxQGhpZ2h3YXl0aHJlZXNvbHV0aW9ucy5jb20iLCJHaXZlbk5hbWUiOiJNZXRhZGF0YSIsIlN1cm5hbWUiOiJBcHByb3Zlcl8xX1VzZXJfMSIsIkVtYWlsIjoiYXJndXMrbWExX3VzZXIxQGhpZ2h3YXl0aHJlZXNvbHV0aW9ucy5jb20iLCJHcm91cHMiOlsiZXhwb3J0ZXIiLCJtZXRhZGF0YV9hcHByb3Zlcl8xX2RpcCJdfQ.ESqoLyihlc-lbfXrzfGaxYa9RWLb6lXmqcs1bghyzas"
        expect(auth.isTokenExpired(token)).is.false
        done()
    })

    it('should show expired token', function (done) {
        const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NTA0NjM2NjAsImV4cCI6MTIyMDQ2MzY2MCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoiYXJndXMrbWExX3VzZXIxQGhpZ2h3YXl0aHJlZXNvbHV0aW9ucy5jb20iLCJHaXZlbk5hbWUiOiJNZXRhZGF0YSIsIlN1cm5hbWUiOiJBcHByb3Zlcl8xX1VzZXJfMSIsIkVtYWlsIjoiYXJndXMrbWExX3VzZXIxQGhpZ2h3YXl0aHJlZXNvbHV0aW9ucy5jb20iLCJHcm91cHMiOlsiZXhwb3J0ZXIiLCJtZXRhZGF0YV9hcHByb3Zlcl8xX2RpcCJdfQ.WXRkVzQqw0eViFOb--PHO-DaTSA3hU2DqxPXOTNffEE"
        expect(auth.isTokenExpired(token)).is.true
        done()
    })

    it('should succeed with renewable token', function (done) {
        const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NTA0NjM2NjAsImV4cCI6MTY1MDQ2MzY2MCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoiYXJndXMrbWExX3VzZXIxQGhpZ2h3YXl0aHJlZXNvbHV0aW9ucy5jb20iLCJHaXZlbk5hbWUiOiJNZXRhZGF0YSIsIlN1cm5hbWUiOiJBcHByb3Zlcl8xX1VzZXJfMSIsIkVtYWlsIjoiYXJndXMrbWExX3VzZXIxQGhpZ2h3YXl0aHJlZXNvbHV0aW9ucy5jb20iLCJHcm91cHMiOlsiZXhwb3J0ZXIiLCJtZXRhZGF0YV9hcHByb3Zlcl8xX2RpcCJdfQ.ESqoLyihlc-lbfXrzfGaxYa9RWLb6lXmqcs1bghyzas"
        expect(auth.isRenewable(token)).is.true
        done()
    })

    it('should succeed because of error refreshing token', function (done) {
        const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NTA0NjM2NjAsImV4cCI6MTIyMDQ2MzY2MCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoiYXJndXMrbWExX3VzZXIxQGhpZ2h3YXl0aHJlZXNvbHV0aW9ucy5jb20iLCJHaXZlbk5hbWUiOiJNZXRhZGF0YSIsIlN1cm5hbWUiOiJBcHByb3Zlcl8xX1VzZXJfMSIsIkVtYWlsIjoiYXJndXMrbWExX3VzZXIxQGhpZ2h3YXl0aHJlZXNvbHV0aW9ucy5jb20iLCJHcm91cHMiOlsiZXhwb3J0ZXIiLCJtZXRhZGF0YV9hcHByb3Zlcl8xX2RpcCJdfQ.WXRkVzQqw0eViFOb--PHO-DaTSA3hU2DqxPXOTNffEE"
        const refresh = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NTA0NjM2NjAsImV4cCI6MTY1MDQ2MzY2MCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoiYXJndXMrbWExX3VzZXIxQGhpZ2h3YXl0aHJlZXNvbHV0aW9ucy5jb20iLCJHaXZlbk5hbWUiOiJNZXRhZGF0YSIsIlN1cm5hbWUiOiJBcHByb3Zlcl8xX1VzZXJfMSIsIkVtYWlsIjoiYXJndXMrbWExX3VzZXIxQGhpZ2h3YXl0aHJlZXNvbHV0aW9ucy5jb20iLCJHcm91cHMiOlsiZXhwb3J0ZXIiLCJtZXRhZGF0YV9hcHByb3Zlcl8xX2RpcCJdfQ.ESqoLyihlc-lbfXrzfGaxYa9RWLb6lXmqcs1bghyzas"
        const req = {
            user: {
                jwt: token,
                refreshToken: refresh
            }
        }
        const res = {

        }
        auth.removeExpired(req, res, () => {
            expect(req).to.have.property('user')
            done()
        })
    })

    it('should succeed removing user because of missing refresh token', function (done) {
        const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NTA0NjM2NjAsImV4cCI6MTIyMDQ2MzY2MCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoiYXJndXMrbWExX3VzZXIxQGhpZ2h3YXl0aHJlZXNvbHV0aW9ucy5jb20iLCJHaXZlbk5hbWUiOiJNZXRhZGF0YSIsIlN1cm5hbWUiOiJBcHByb3Zlcl8xX1VzZXJfMSIsIkVtYWlsIjoiYXJndXMrbWExX3VzZXIxQGhpZ2h3YXl0aHJlZXNvbHV0aW9ucy5jb20iLCJHcm91cHMiOlsiZXhwb3J0ZXIiLCJtZXRhZGF0YV9hcHByb3Zlcl8xX2RpcCJdfQ.WXRkVzQqw0eViFOb--PHO-DaTSA3hU2DqxPXOTNffEE"
        const req = {
            user: {
                jwt: token,
                refreshToken: null
            }
        }
        const res = {}
        auth.removeExpired(req, res, () => {
            expect(req).not.to.have.property('user')
            done()
        })
    })

    it('should succeed removing user because of non-renewable refresh token', function (done) {
        const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NTA0NjM2NjAsImV4cCI6MTIyMDQ2MzY2MCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoiYXJndXMrbWExX3VzZXIxQGhpZ2h3YXl0aHJlZXNvbHV0aW9ucy5jb20iLCJHaXZlbk5hbWUiOiJNZXRhZGF0YSIsIlN1cm5hbWUiOiJBcHByb3Zlcl8xX1VzZXJfMSIsIkVtYWlsIjoiYXJndXMrbWExX3VzZXIxQGhpZ2h3YXl0aHJlZXNvbHV0aW9ucy5jb20iLCJHcm91cHMiOlsiZXhwb3J0ZXIiLCJtZXRhZGF0YV9hcHByb3Zlcl8xX2RpcCJdfQ.WXRkVzQqw0eViFOb--PHO-DaTSA3hU2DqxPXOTNffEE"
        const refresh = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NTA0NjM2NjAsImV4cCI6MTIyMDQ2MzY2MCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoiYXJndXMrbWExX3VzZXIxQGhpZ2h3YXl0aHJlZXNvbHV0aW9ucy5jb20iLCJHaXZlbk5hbWUiOiJNZXRhZGF0YSIsIlN1cm5hbWUiOiJBcHByb3Zlcl8xX1VzZXJfMSIsIkVtYWlsIjoiYXJndXMrbWExX3VzZXIxQGhpZ2h3YXl0aHJlZXNvbHV0aW9ucy5jb20iLCJHcm91cHMiOlsiZXhwb3J0ZXIiLCJtZXRhZGF0YV9hcHByb3Zlcl8xX2RpcCJdfQ.WXRkVzQqw0eViFOb--PHO-DaTSA3hU2DqxPXOTNffEE"
        const req = {
            user: {
                jwt: token,
                refreshToken: refresh
            }
        }
        const res = {}
        auth.removeExpired(req, res, () => {
            expect(req).not.to.have.property('user')
            done()
        })
    })

    it('should succeed with no impact from missing jwt', function (done) {
        const req = {
            user: {
                jwt: null,
                refreshToken: null
            }
        }
        const res = {}
        auth.removeExpired(req, res, () => {
            expect(req).to.have.property('user')
            done()
        })
    })

    it('should succeed with removing user due to expired jwt', function (done) {
        const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NTA0NjM2NjAsImV4cCI6MTIyMDQ2MzY2MCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoiYXJndXMrbWExX3VzZXIxQGhpZ2h3YXl0aHJlZXNvbHV0aW9ucy5jb20iLCJHaXZlbk5hbWUiOiJNZXRhZGF0YSIsIlN1cm5hbWUiOiJBcHByb3Zlcl8xX1VzZXJfMSIsIkVtYWlsIjoiYXJndXMrbWExX3VzZXIxQGhpZ2h3YXl0aHJlZXNvbHV0aW9ucy5jb20iLCJHcm91cHMiOlsiZXhwb3J0ZXIiLCJtZXRhZGF0YV9hcHByb3Zlcl8xX2RpcCJdfQ.WXRkVzQqw0eViFOb--PHO-DaTSA3hU2DqxPXOTNffEE"
        const req = {
            user: {
                jwt: token,
                refreshToken: null
            }
        }
        const res = {}
        auth.removeExpired(req, res, () => {
            expect(req).to.not.have.property('user')
            done()
        })
    })

})