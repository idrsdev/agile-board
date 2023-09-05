import { createTestDatabase } from './setup-utils';
import { ensureGlobalConfigService } from '../config.service';

module.exports = async () => {
  const { globalConfigService } = await ensureGlobalConfigService();

  await createTestDatabase(globalConfigService);
};
