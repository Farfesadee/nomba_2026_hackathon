#!/bin/bash
TOKEN=$(curl -s -X POST https://sandbox.nomba.com/v1/auth/token/issue \
  -H 'Content-Type: application/json' \
  -H 'accountId: f666ef9b-888e-4799-85ce-acb505b28023' \
  -d '{"grant_type":"client_credentials","client_id":"706df6c4-b8bb-4130-88c4-d21b052f8631","client_secret":"k8UobYk3APgOoxUnNL7VpuxzwTsH4LsXtydfjcHs8RH0YISBB4OMqJsaafG+U8fWETu9YZ96bNXE+DelCDuMPw=="}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('access_token','FAILED'))")

echo "TOKEN: $TOKEN"
if [ "$TOKEN" = "FAILED" ]; then echo 'Auth failed'; exit 1; fi

echo '--- /sandbox/checkout/order ---'
curl -s -X POST https://sandbox.nomba.com/sandbox/checkout/order \
  -H 'Content-Type: application/json' \
  -H "accountId: f666ef9b-888e-4799-85ce-acb505b28023" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"order":{"orderReference":"test-curl-001","amount":"1000.00","currency":"NGN","customerEmail":"test@example.com","callbackUrl":"https://accredit.vip/dashboard/wallet"}}'

echo ''
echo '--- /v1/checkout/order ---'
curl -s -X POST https://sandbox.nomba.com/v1/checkout/order \
  -H 'Content-Type: application/json' \
  -H "accountId: f666ef9b-888e-4799-85ce-acb505b28023" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"order":{"orderReference":"test-curl-001","amount":"1000.00","currency":"NGN","customerEmail":"test@example.com","callbackUrl":"https://accredit.vip/dashboard/wallet"}}'
