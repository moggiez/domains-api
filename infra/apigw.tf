module "orgId_path_part" {
  source             = "git@github.com:moggiez/terraform-modules.git//lambda_gateway"
  api                = aws_api_gateway_rest_api._
  lambda             = module.api_lambda.lambda
  http_methods       = toset([])
  resource_path_part = "{organisationId}"
  authorizer         = local.authorizer
}

module "orgId_path_part_cors" {
  source          = "git@github.com:moggiez/terraform-modules.git//api_gateway_enable_cors"
  api_id          = aws_api_gateway_rest_api._.id
  api_resource_id = module.orgId_path_part.api_resource.id
}

module "domains_path_part" {
  source             = "git@github.com:moggiez/terraform-modules.git//lambda_gateway"
  api                = aws_api_gateway_rest_api._
  parent_resource    = module.orgId_path_part.api_resource
  lambda             = module.api_lambda.lambda
  http_methods       = toset(["GET"])
  resource_path_part = "domains"
  authorizer         = local.authorizer
}

module "domains_path_part_cors" {
  source          = "git@github.com:moggiez/terraform-modules.git//api_gateway_enable_cors"
  api_id          = aws_api_gateway_rest_api._.id
  api_resource_id = module.domains_path_part.api_resource.id
}

module "domainName_path_part" {
  source             = "git@github.com:moggiez/terraform-modules.git//lambda_gateway"
  api                = aws_api_gateway_rest_api._
  parent_resource    = module.domains_path_part.api_resource
  lambda             = module.api_lambda.lambda
  http_methods       = toset(["GET", "POST", "DELETE"])
  resource_path_part = "{domainName}"
  authorizer         = local.authorizer
}

module "domainName_path_part_cors" {
  source          = "git@github.com:moggiez/terraform-modules.git//api_gateway_enable_cors"
  api_id          = aws_api_gateway_rest_api._.id
  api_resource_id = module.domainName_path_part.api_resource.id
}