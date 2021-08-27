# INFRASTRUCTURE
VAR_FILE=default.tfvars

modules-cleanup:
	cd infra && rm -rf .terraform/modules

infra-fmt:
	cd infra && terraform fmt -recursive

infra-init:
	cd infra && terraform init -force-copy -backend-config=./tf_backend.cfg

infra-debug:
	cd infra && TF_LOG=DEBUG terraform apply -auto-approve -var-file="${VAR_FILE}" infra

infra-deploy: modules-cleanup infra-init
	cd infra && terraform apply -auto-approve -var-file="${VAR_FILE}"

infra-preview: modules-cleanup infra-init
	cd infra && terraform plan -var-file="${VAR_FILE}"

infra-destroy: infra-init
	cd infra && terraform destroy

# CODE
build-cleanup:
	rm -rf ./dist/* & mkdir -p dist && rm -rf ./src/node_modules

build: build-cleanup
	cd src && npm i --only=prod && zip -r ../dist/domains-api.zip ./

build-dev: build-cleanup
	cd src && npm i

lint:
	npm run lint

format:
	npm run format

test:
	npm run test

update-lambda-fn: build
	aws lambda update-function-code --function-name domains-api --zip-file fileb://$(shell pwd)/dist/domains-api.zip --publish | jq .FunctionArn

# NPM COMMANDS
npm-auth:
	./scripts/npm_auth.sh