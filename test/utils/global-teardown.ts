import { ensureGlobalConfigService } from '../config.service';
import { dropTestDatabase } from './setup-utils';

module.exports = async () => {
  const { globalConfigService } = await ensureGlobalConfigService();
  await dropTestDatabase(globalConfigService);
};
