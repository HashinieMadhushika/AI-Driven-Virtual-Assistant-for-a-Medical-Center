'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const [results] = await queryInterface.sequelize.query(`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name='appointments'
          AND column_name='appointmentTime'
        );
      `);

      if (results[0].exists) {
        console.log('Converting appointmentTime column to TIME type...');

        await queryInterface.sequelize.query(
          'ALTER TABLE "appointments" DROP COLUMN IF EXISTS "appointmentTime_temp"'
        );

        await queryInterface.addColumn('appointments', 'appointmentTime_temp', {
          type: Sequelize.TIME,
          allowNull: true
        });

        await queryInterface.sequelize.query(`
          UPDATE "appointments"
          SET "appointmentTime_temp" = split_part("appointmentTime", ' - ', 1)::time
          WHERE "appointmentTime" IS NOT NULL
        `);

        await queryInterface.removeColumn('appointments', 'appointmentTime');
        await queryInterface.renameColumn('appointments', 'appointmentTime_temp', 'appointmentTime');
        await queryInterface.changeColumn('appointments', 'appointmentTime', {
          type: Sequelize.TIME,
          allowNull: false
        });

        console.log('appointmentTime column converted successfully.');
      } else {
        console.log('appointmentTime column does not exist, skipping migration.');
      }
    } catch (error) {
      console.error('Migration error:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const [results] = await queryInterface.sequelize.query(`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name='appointments'
          AND column_name='appointmentTime'
        );
      `);

      if (results[0].exists) {
        console.log('Rolling back appointmentTime column to DATE type...');

        await queryInterface.addColumn('appointments', 'appointmentTime_temp', {
          type: Sequelize.DATE,
          allowNull: true
        });

        await queryInterface.sequelize.query(`
          UPDATE "appointments"
          SET "appointmentTime_temp" = CURRENT_TIMESTAMP
          WHERE "appointmentTime" IS NOT NULL
        `);

        await queryInterface.removeColumn('appointments', 'appointmentTime');
        await queryInterface.renameColumn('appointments', 'appointmentTime_temp', 'appointmentTime');
      }
    } catch (error) {
      console.error('Rollback error:', error.message);
      throw error;
    }
  }
};
