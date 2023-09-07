import { ensureGlobalConfigService } from '../config.service';
import testDatabaseMananger from './test-database-manager';

module.exports = async () => {
  const { globalConfigService } = await ensureGlobalConfigService();
  await testDatabaseMananger.dropTestDatabase(globalConfigService);
};
