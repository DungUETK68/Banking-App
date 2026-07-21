import * as geoip from 'geoip-lite';

export class GeoUtil {
    static getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    static getDistanceBetweenIPs(ip1: string, ip2: string): number | null {
        if (ip1 === ip2) return 0;

        const geo1 = geoip.lookup(ip1);
        const geo2 = geoip.lookup(ip2);
        
        if (!geo1 || !geo2) return null;

        return this.getDistance(geo1.ll[0], geo1.ll[1], geo2.ll[0], geo2.ll[1]);
    }
}