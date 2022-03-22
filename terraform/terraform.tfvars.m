
mongodb = {
    username = "appuser"
}

hostname = "mc.example.demo"
host = "https://mc.example.demo"

sslCertificate = "/ssl/example.crt"
sslCertificateKey = "/ssl/example.key"

images = {
    owner = "bcgovimages"
    forum_api = "bcgovimages/ocwa_forum_api:edge"
    formio = "h3brandon/formio:latest"
    frontend = ":edge"
    tusd = ":latest"
    minio = ":latest"
    frontend_bridge = ":edge"
}

oidc = {
    issuer = ""
    authorizationURL = "",
    tokenURL = "",
    userInfoURL = "",
    clientID = "",
    clientSecret = "",
}

base64EncodedPGPPublicKey = "LS0tLS1CRUdJTiBQR1AgUFVCTElDIEtFWSBCTE9DSy0tLS0tCgptUUlOQkY1aEpCSUJFQURXZ1ZUQmVXQWlKallkdTdlcVZhK1FXbXM0YmJmUUcwUjV5a0lpSVVXMGVNdTF5UXk0CnN6cit5ZTZpMkZ5RWZaUlFzbEJCeTBVWCtMK2picndBbXRrblJHWmw3RWE2UGZiREZGNk1HQm11TlhlQStvT1gKZkkxTlk3U0xxWDNGL2pLMnRIcU55QnZrU2tnYnRUcUZQYmVEZUFwa3M3cWI4WStmdUtkRGE5TGpoZEJiU1Fpago0T3JEOEk4RVVUaEZRVkF4Nldrdkl5aTVCQ2xtZVR5Y1F0YjBXKzdvTnVRbEtSMDNBYmNvNzF2VlBtMU9mM2hGClYyOUhmOWMyZndyS0F6ZGUvNTlhcE5RSHVaZ2wrYUo0TEQxamM1STQxc0NWQ1F0bzlrbXZIalB3ODZpT3Evc1oKMWVoZlNDVlpDTHNIcVVBOUcwVyswbUhTVmRIZHN0K01jK0pPRndEMHJ3Y2JMYnM1Q25oYkRKMHVpbUo2d3B2dApVU2hWUmNNb0VBSnNvRDczVlpRTGN0T2poRzhKZ2RZTkJMVVJMY0pNT094MVpqVi9hbEgxN3J1eWt4MlNCTXd0Cmh1QVZSQTBPMDg0dFJVd1ZBZ20yeDJ1TkxTWko3RlhzVzk5NEdCczF2OXpRNUhOclhNazB4WGxWU2ZhY3YrUmQKZnpoaFRiM3ZPQUpvQk1ITmNBNlRaWDVOTkJYbURmZCtkQUFVMm52RFJuLzN5SnViWG1yMmZDN1V1ODhoQ2l4Vwp5Sy9mazhvRk1md0pxODNxRy9VMVYrZGpjK1lkenJUK29IRFVzUWphSTBFc1h1alZIb1VWUW5EWG03WVR5a1IrCk53aGwvMUZZcDgzeklGRFpHZ0pTbTh1Q0psSERvTUVoOVd4aXluZkdwUER1SE5xQSsxTnNyMVFxWXdBUkFRQUIKdERSQ2NtRnVaRzl1SUZOb1lYSnlZWFIwSUR4aWNtRnVaRzl1UUdocFoyaDNZWGwwYUhKbFpYTnZiSFYwYVc5dQpjeTVqYjIwK2lRSk9CQk1CQ0FBNEZpRUUwQzlYZk9uanE2NnBSZGhJMkpZUnNBSHJjLzhGQWw1aEpCSUNHdzhGCkN3a0lCd0lHRlFvSkNBc0NCQllDQXdFQ0hnRUNGNEFBQ2drUTJKWVJzQUhyYy84bmRBLy9WcDJJT2lsLzB0RVYKQXV4VktIRzN6MEkwTlkxYkY1c056SHZxckt0dlRIa1h0SEY1YkFIcy9tY2dyWjdjeVVYSEtBLzE4QStrRUNKdApBS2VnazlzYXN2YThOT0lNWkVWWjZncXRxSkxVbkZzbW1ENVQvcjBWbk9Gb2pKMlU3UHJEUTBoSWd0ekJXMS9zCmYzb0NBTWxxWmg1Rm9DWlhKRWM0WXRKWXErYVdVVVZBaVpPMzVnN3NaVmN4MHpLNm04L2Zlanc5RmVad0tPL2MKL0pKNzBydkJCRUhMdVdpd251dzFzN3lMTFVxOTZPZllyN0NHaVZ4dWlPSUtpQS9rWE5XWDkyZE9jWHVUWFQ2dwpiWFRJVEgxRHAxNXgzS0pRQmpZMENaRERtRURwTjlZY0VDWWhGb2xScVFEbE5yeS9EVy8weWhUVWtoVHd0TnRpCk90SWZDVVJ5WTIvdStGZW1HYWFONGFCSUZsMVdzRU5nT0lkVnpjdko2Ulc2ZTRSSGRJRk53bDBQOVZZMzdlQzkKbE5vSWJkTmZ0UkxIY241OU51dXlSU0tVSEp4eSsyTWxWazMzdFRaWUdsekkyTFFoeDZVSlJ5UWIwZ0lUNHVQTApxSTRzSEFocGJwY3FidUVPOW42WEZLVnR5WDNHREpCWnU5ZnQ4SnowVEYxSmNEMFBVRXhva3NUQWNacnZuYXVZCjJ1SHZxLzNIZlhkemdVb1F2MDBSeDFPcjRubUJrRnpHb0EvWTYrbXpISE90T3ZLU3hxOU9yS2VmcWp4SEVOOUsKdXA5YWFGL0xFNHl3ZlE1Q1pKazdubmlQV1U1UHEyNngvYTFDbldUQzdwQkx3emVCdG1tVlI1OFR1d1ZRVEJUawpOZHVNTXNMM1AxSHNRcS9Gek8raElwVlBBTEd1MkZBPQo9VWRCZwotLS0tLUVORCBQR1AgUFVCTElDIEtFWSBCTE9DSy0tLS0tCg=="

orgAttribute = "businessCategory"
requiredRoleToCreateRequest = "exporter"
alwaysNotifyListOnTopicCreate = "false"
alwaysNotifyUninvolvedOnCommentAdd = "true"
approverGroups = ["metadata_approver_1_dip", "metadata_approver_2_dip"]
alwaysNotifyList = {
    "business_category_1": [
      {
        "name": "Metadata Approver_1_User_1",
        "email": "{email}"
      },
      {
        "name": "Metadata Approver_1_User_2",
        "email": "{email}}"
      }
    ],
    "business_category_2": [
      {
        "name": "Metadata Approver_2_User_1",
        "email": "{email}"
      },
      {
        "name": "Metadata Approver_2_User_2",
        "email": "{email}"
      }
    ]
  }

email = {
    "enabled": false,
    "service": "smtp.gmail.com",
    "secure": true,
    "port": 465,
    "user": "{user}",
    "pass": "{password}",
    "from": "{email}",
    "subject": "Data Upload Update"
  }

adminGroup = "mc-admin"

formio = {
    "url": "http://localhost:3006",
    "username": "admin@example.com",
    "password": "CHANGEME"
}

postgres = {
  username = "kcuser"
}

keycloak = {
  username = "kcadmin"
}

userIdField = "preferred_username"

emailField = "email"

givenNameField = "given_name"

surnameField = "family_name"

groupField = "groups"

ignoreGroups = "researchers"

makeKeycloak = true
