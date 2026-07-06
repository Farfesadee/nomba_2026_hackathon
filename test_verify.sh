#!/bin/bash
TOKEN=$(curl -s -X POST https://sandbox.nomba.com/v1/auth/token/issue \
  -H 'Content-Type: application/json' \
  -H 'accountId: f666ef9b-888e-4799-85ce-acb505b28023' \
  -d '{"grant_type":"client_credentials","client_id":"706df6c4-b8bb-4130-88c4-d21b052f8631","client_secret":"k8UobYk3APgOoxUnNL7VpuxzwTsH4LsXtydfjcHs8RH0YISBB4OMqJsaafG+U8fWETu9YZ96bNXE+DelCDuMPw=="}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('access_token','FAILED'))")

echo '--- /v1/transaction/requery/b8098c0e-be1b-40a5-8c74-3920ef17a3ed ---'
curl -s https://sandbox.nomba.com/v1/transaction/requery/b8098c0e-be1b-40a5-8c74-3920ef17a3ed \
  -H "accountId: f666ef9b-888e-4799-85ce-acb505b28023" \
  -H "Authorization: Bearer $TOKEN"

echo ''
echo '--- /sandbox/checkout/transaction?idType=orderReference&id=b8098c0e-be1b-40a5-8c74-3920ef17a3ed ---'
curl -s "https://sandbox.nomba.com/sandbox/checkout/transaction?idType=orderReference&id=b8098c0e-be1b-40a5-8c74-3920ef17a3ed" \
  -H "accountId: f666ef9b-888e-4799-85ce-acb505b28023" \
  -H "Authorization: Bearer $TOKEN"

echo ''
echo '--- /v1/checkout/transaction?idType=orderReference&id=b8098c0e-be1b-40a5-8c74-3920ef17a3ed ---'
curl -s "https://sandbox.nomba.com/v1/checkout/transaction?idType=orderReference&id=b8098c0e-be1b-40a5-8c74-3920ef17a3ed" \
  -H "accountId: f666ef9b-888e-4799-85ce-acb505b28023" \
  -H "Authorization: Bearer $TOKEN"
