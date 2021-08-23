resource "aws_dynamodb_table" "domains" {
  name           = "domains"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "OrganisationId"
  range_key      = "DomainName"

  attribute {
    name = "OrganisationId"
    type = "S"
  }

  attribute {
    name = "DomainName"
    type = "S"
  }

  attribute {
    name = "DomainValidationState"
    type = "S"
  }

  // ValidationState, ValidationExpirationDate, ValidationRecordName, ValidationRecordValue

  global_secondary_index {
    name            = "Domains"
    hash_key        = "DomainName"
    range_key       = "OrganisationId"
    write_capacity  = 5
    read_capacity   = 5
    projection_type = "KEYS_ONLY"
  }

  global_secondary_index {
    name            = "DomainValidationState"
    hash_key        = "DomainValidationState"
    range_key       = "DomainName"
    write_capacity  = 5
    read_capacity   = 5
    projection_type = "ALL"
  }
}