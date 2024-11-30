import { createRequire } from 'module';
import { Umzug, SequelizeStorage } from 'umzug';
import { Sequelize } from 'sequelize';
import path from 'path';
import glob from 'glob';
import {fileURLToPath} from "url";

const require = createRequire(import.meta.url);

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const migrationPath = path.join(__dirname, 'migrations/*.js');

function createMigrator(sequelize, config, logger) {

    const migrationFiles = glob.sync(migrationPath.replace(/\\/g, '/'));
    logger.info(`Found ${migrationFiles.length} migration files:`, migrationFiles);

    return new Umzug({
        migrations: {
            glob: migrationPath.replace(/\\/g, '/'),
            resolve: (params) => {
                if (params.path.endsWith('.mjs') || params.path.endsWith('.js')) {
                    const getModule = () => import(`file:///${params.path.replace(/\\/g, '/')}`);
                    return {
                        name: params.name,
                        path: params.path,
                        up: async (upParams) => (await getModule()).up(upParams, logger),
                        down: async (downParams) => (await getModule()).down(downParams, logger),
                    };
                }
                return {
                    name: params.name,
                    path: params.path,
                    // eslint-disable-next-line import/no-dynamic-require
                    ...require(params.path),
                };
            },
        },
        context: { queryInterface: sequelize.getQueryInterface(), Sequelize },
        storage: new SequelizeStorage({ sequelize, tableName: 'sequelize_meta' }),
        logger: config.logging ? config.logger : { info: () => {} },
    });
}

export default createMigrator;
