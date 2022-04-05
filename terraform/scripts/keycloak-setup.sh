#!/bin/bash -e

export KEYCLOAK_HOME=`pwd`/keycloak
export PATH=$PATH:$KEYCLOAK_HOME/bin

keycloak/bin/kcadm.sh config credentials --server http://mc_keycloak:8080/auth --realm master --user $KEYCLOAK_USER --client admin-cli --password $KEYCLOAK_PASSWORD

keycloak/bin/kcadm.sh create realms -s realm=mc -s enabled=true -o

CID=$(kcadm.sh create clients -r mc -f /work/scripts/keycloak-client-outputchecker.json -s clientId=outputchecker -s enabled=true -s clientAuthenticatorType=client-secret -s secret=$KEYCLOAK_CLIENT_SECRET -s "redirectUris=[\"http://*\",\"https://*\"]" -i)

echo "Client = $CID"

kcadm.sh get clients/$CID -r mc

echo "CREATE GID1 $REQUIRED_CREATE_ROLE"
GID1=$(kcadm.sh create groups -r mc -s name=$REQUIRED_CREATE_ROLE -i)

echo "CREATE GID2 $APPROVER_0"
GID2=$(kcadm.sh create groups -r mc -s name=$APPROVER_0 -i)

echo "CREATE GID3 $APPROVER_1"
GID3=$(kcadm.sh create groups -r mc -s name=$APPROVER_1 -i)

echo "CREATE GID4 $BUSCAT_0"
GID4=$(kcadm.sh create groups -r mc -s name=$BUSCAT_0 -i)

echo "CREATE GID5 $BUSCAT_1"
GID5=$(kcadm.sh create groups -r mc -s name=$BUSCAT_1 -i)

echo "CREATE GID6 group"
GID6=$(kcadm.sh create groups -r mc -s name=group -i)

echo "Group = $GID1"
echo "Group = $GID2"
echo "Group = $GID3"
echo "Group = $GID4"
echo "Group = $GID5"
echo "Group = $GID6"

TUID=$(kcadm.sh create users -r mc -s username=testuser -s enabled=true -s email=testuser@nowhere.com -s firstName=TestF -s lastName=TestL -i)

echo "Test User = $TUID"

kcadm.sh update users/$TUID/groups/$GID1 -r mc -s realm=mc -s userId=$TUID -s groupId=$GID1 -n

kcadm.sh update users/$TUID/groups/$GID2 -r mc -s realm=mc -s userId=$TUID -s groupId=$GID2 -n

kcadm.sh update users/$TUID/groups/$GID3 -r mc -s realm=mc -s userId=$TUID -s groupId=$GID3 -n

kcadm.sh update users/$TUID/groups/$GID4 -r mc -s realm=mc -s userId=$TUID -s groupId=$GID4 -n

kcadm.sh update users/$TUID/groups/$GID5 -r mc -s realm=mc -s userId=$TUID -s groupId=$GID5 -n

kcadm.sh update users/$TUID/groups/$GID6 -r mc -s realm=mc -s userId=$TUID -s groupId=$GID6 -n

kcadm.sh set-password -r mc --username testuser --new-password $TESTUSER_PASSWORD

# kcadm.sh create users -r mc -s username=testuser3 -s enabled=true -s email=testuser3@nowhere.com -s firstName=TestF -s lastName=TestL

TUID=$(kcadm.sh create users -r mc -s username=provider_1 -s enabled=true -s email=provider_1@nowhere.com -s firstName=Provi -s lastName=Der1 -i)
echo "Provider User $TUID"

kcadm.sh update users/$TUID/groups/$GID1 -r mc -s realm=mc -s userId=$TUID -s groupId=$GID1 -n
echo "Provider User Added group 1"
kcadm.sh update users/$TUID/groups/$GID6 -r mc -s realm=mc -s userId=$TUID -s groupId=$GID6 -n
echo "Provider User Added group 6"
kcadm.sh update users/$TUID -r mc -s "attributes={\"$ORG_ATT\":[\"$BUSCAT_0\"]}"
echo "Provider User Added attribute"
kcadm.sh set-password -r mc --username provider_1 --new-password provider_1_password
echo "Provider User set password"

TUID=$(kcadm.sh create users -r mc -s username=provider_2 -s enabled=true -s email=provider_2@nowhere.com -s firstName=Provi -s lastName=Der2 -i)
echo "Provider User 2 $TUID"

kcadm.sh update users/$TUID/groups/$GID1 -r mc -s realm=mc -s userId=$TUID -s groupId=$GID1 -n
kcadm.sh update users/$TUID/groups/$GID6 -r mc -s realm=mc -s userId=$TUID -s groupId=$GID6 -n
kcadm.sh update users/$TUID -r mc -s "attributes={\"$ORG_ATT\":[\"$BUSCAT_1\"]}"
kcadm.sh set-password -r mc --username provider_2 --new-password provider_2_password

TUID=$(kcadm.sh create users -r mc -s username=approver_1 -s enabled=true -s email=approver_1@nowhere.com -s firstName=Appro -s lastName=Ver1 -i)
echo "Approver User $TUID"
kcadm.sh update users/$TUID/groups/$GID2 -r mc -s realm=mc -s userId=$TUID -s groupId=$GID2 -n
kcadm.sh update users/$TUID/groups/$GID4 -r mc -s realm=mc -s userId=$TUID -s groupId=$GID4 -n
kcadm.sh update users/$TUID/groups/$GID6 -r mc -s realm=mc -s userId=$TUID -s groupId=$GID6 -n
kcadm.sh set-password -r mc --username approver_1 --new-password approver_1_password

TUID=$(kcadm.sh create users -r mc -s username=approver_2 -s enabled=true -s email=approver_2@nowhere.com -s firstName=Appro -s lastName=Ver2 -i)
echo "Approver User 2 $TUID"
kcadm.sh update users/$TUID/groups/$GID3 -r mc -s realm=mc -s userId=$TUID -s groupId=$GID3 -n
kcadm.sh update users/$TUID/groups/$GID5 -r mc -s realm=mc -s userId=$TUID -s groupId=$GID5 -n
kcadm.sh update users/$TUID/groups/$GID6 -r mc -s realm=mc -s userId=$TUID -s groupId=$GID6 -n
kcadm.sh set-password -r mc --username approver_2 --new-password approver_2_password