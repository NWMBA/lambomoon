-- Avoid duplicate imported/submitted contracts per ecosystem while still allowing null contract addresses.
CREATE UNIQUE INDEX IF NOT EXISTS idx_cryptos_ecosystem_contract_unique
  ON cryptos (ecosystem, contract_address)
  WHERE contract_address IS NOT NULL;
