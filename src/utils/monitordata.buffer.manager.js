import { Device } from '#src/models/Device.js';
import { Area } from '#src/models/Area.js';
import { MonitorData } from '#src/models/MonitorData.js';
import { createAlert, REASON_NOTIFICATION } from '#src/alert.js';
import logger from '#src/logger.js';

class MonitorDataBufferManager {
    constructor(batchInterval = 10000) {
        this.buffers = new Map();
        this.batchInterval = batchInterval;
    }

    /**
     * @param {Object} data -
     */
    async addData(data) {
        const serialNumber = data.ID;
        try {
            let device = await Device.findOne({ serialNumber }).lean();
            if (!device) {
                const newDevice = await Device.create({ serialNumber });
                device = newDevice.toObject();
                createAlert(REASON_NOTIFICATION.ConfigDevice, data);
                logger.info(`[MonitorData]|[NEW_Device] ${JSON.stringify(device)}`);
            }

            const deviceId = device._id.toString();

            if (!this.buffers.has(deviceId)) {
                const deviceConfig = device.configuration || {};

                this.buffers.set(deviceId, { buffer: [], config: deviceConfig });
                this.startTimer(deviceId);
            }

            this.buffers.get(deviceId).buffer.push(data);
        } catch (error) {
            logger.error(`[MonitorData][Error] Adding data to buffer: ${error.message}`);
        }
    }

    /**
     * @param {String} deviceId
     */
    startTimer(deviceId) {
        setInterval(async () => {
            await this.flushBuffer(deviceId);
        }, this.batchInterval);
    }

    /**
     * @param {String} deviceId
     */
    async flushBuffer(deviceId) {
        const bufferData = this.buffers.get(deviceId);
        if (!bufferData || bufferData.buffer.length === 0) return;

        const { buffer, config } = bufferData;
        this.buffers.set(deviceId, { buffer: [], config });
        for (const data of buffer) {
            await this.handleSingleMonitorData(data, config);
        }
    }

    /**
     * @param {Object} data - Dữ liệu monitor từ thiết bị
     * @param {Object} config - Cấu hình của thiết bị
     */
    async handleSingleMonitorData(data, config) {
        try {
            const serialNumber = data.ID;
            let device = await Device.findOne({ serialNumber }).lean();
            if (!device) {
                const _device = (await Device.create({ serialNumber })).toObject();
                createAlert(REASON_NOTIFICATION.ConfigDevice, data);
                logger.info(`[MonitorData]|[NEW_Device] ${JSON.stringify(_device)}`);
                device = _device;
            } else {
                const area = await Area.findOne({ _id: device.area }).lean();
                // Setter
                data.deviceName = device.name;
                data.areaName = area ? area.name : 'Unknown Area';
            }

            if (data.doorStatus) createAlert(REASON_NOTIFICATION.DoorOpen, data);
            if (config) {
                const { minTemperature, maxTemperature, minHumidity, maxHumidity } = config;
                const isExceedTemperature = data.temperature > maxTemperature;
                const isExceedHumidity = data.humidity > maxHumidity;
                const isLessTemperature = data.temperature < minTemperature;
                const isLessHumidity = data.humidity < minHumidity;

                if (isExceedTemperature) createAlert(REASON_NOTIFICATION.OverTemperature, data);
                if (isExceedHumidity) createAlert(REASON_NOTIFICATION.OverHumidity, data);
                if (isLessTemperature) createAlert(REASON_NOTIFICATION.BelowTemperature, data);
                if (isLessHumidity) createAlert(REASON_NOTIFICATION.BelowHumidity, data);
            }

            // Setter
            data.device = device._id.toString();
            const newMonitorData = await MonitorData.create(data);
            logger.info(`[MonitorData] created: ${newMonitorData._id}`);
            return `Data created successfully`;
        } catch (error) {
            logger.error(`[MonitorData][Error] Processing monitor data: ${error.message}`);
        }
    }

    /**
     * Xử lý tất cả các bộ đệm khi server dừng
     */
    async flushAllBuffers() {
        for (const deviceId of this.buffers.keys()) {
            await this.flushBuffer(deviceId);
        }
    }
}

const monitorDataBufferManager = new MonitorDataBufferManager();

export default monitorDataBufferManager;
