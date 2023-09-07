import testDatabaseMananger from './test-database-manager';
import { ensureGlobalConfigService } from '../config.service';

module.exports = async () => {
  const { globalConfigService } = await ensureGlobalConfigService();

  await testDatabaseMananger.createTestDatabase(globalConfigService);
};
