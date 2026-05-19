const geolib = require('geolib');

class RoutePlannerService {
  constructor() {
    this.warehouseLocation = {
      latitude: 39.9042,
      longitude: 116.4074,
    };
  }

  calculateDistance(point1, point2) {
    return geolib.getDistance(
      { latitude: point1.latitude, longitude: point1.longitude },
      { latitude: point2.latitude, longitude: point2.longitude },
    );
  }

  calculateRouteDuration(distance, speed = 5) {
    return (distance / 1000 / speed) * 60;
  }

  optimizeRoute(deliveryPoints, currentLocation = null) {
    if (deliveryPoints.length === 0) return [];

    const startPoint = currentLocation || this.warehouseLocation;
    const unvisited = [...deliveryPoints];
    const optimizedRoute = [];
    let currentPos = startPoint;

    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const distance = this.calculateDistance(currentPos, unvisited[i]);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }

      const selected = unvisited[nearestIndex];
      optimizedRoute.push({
        ...selected,
        distanceFromLast: nearestDistance,
        estimatedDuration: this.calculateRouteDuration(nearestDistance),
      });

      currentPos = selected;
      unvisited.splice(nearestIndex, 1);
    }

    return optimizedRoute;
  }

  assignDeliveryPerson(order, availableDeliveryPersons) {
    if (availableDeliveryPersons.length === 0) return null;

    const orderLocation = {
      latitude: order.recipient.latitude || this.warehouseLocation.latitude,
      longitude: order.recipient.longitude || this.warehouseLocation.longitude,
    };

    let bestMatch = null;
    let bestDistance = Infinity;

    for (const dp of availableDeliveryPersons) {
      const dpLocation = dp.currentLocation || this.warehouseLocation;
      const distance = this.calculateDistance(orderLocation, dpLocation);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = dp;
      }
    }

    return bestMatch
      ? {
          deliveryPerson: bestMatch,
          distance: bestDistance,
          estimatedTime: this.calculateRouteDuration(bestDistance),
        }
      : null;
  }

  batchAssignOrders(orders, deliveryPersons) {
    const availablePersons = deliveryPersons.filter((dp) => dp.status === 'available');
    const assignments = [];
    const unassignedOrders = [];

    const ordersWithLocation = orders.map((order) => ({
      ...order,
      location: {
        latitude: order.recipient?.latitude || this.warehouseLocation.latitude,
        longitude: order.recipient?.longitude || this.warehouseLocation.longitude,
      },
    }));

    const groupedByArea = this.groupOrdersByArea(ordersWithLocation);

    for (const [area, areaOrders] of Object.entries(groupedByArea)) {
      const personsInArea = availablePersons.filter((dp) =>
        dp.deliveryArea?.some((da) => da.district === area && da.isPrimary),
      );

      const personsToUse = personsInArea.length > 0 ? personsInArea : availablePersons;

      const personsWorkload = new Map();
      personsToUse.forEach((p) => personsWorkload.set(p.id, 0));

      for (const order of areaOrders) {
        let assigned = false;

        for (const dp of personsToUse) {
          const workload = personsWorkload.get(dp.id) || 0;
          if (workload < 5) {
            const dpLocation = dp.currentLocation || this.warehouseLocation;
            const estimatedTime = this.calculateRouteDuration(
              this.calculateDistance(dpLocation, order.location),
            );

            assignments.push({
              orderId: order._id || order.id,
              orderNo: order.orderNo,
              deliveryPersonId: dp._id || dp.id,
              deliveryPersonName: dp.name,
              estimatedTime,
              priority: areaOrders.indexOf(order),
            });

            personsWorkload.set(dp.id, workload + 1);
            assigned = true;
            break;
          }
        }

        if (!assigned) {
          unassignedOrders.push(order);
        }
      }
    }

    return {
      assignments,
      unassignedOrders,
      stats: {
        totalOrders: orders.length,
        assigned: assignments.length,
        unassigned: unassignedOrders.length,
      },
    };
  }

  groupOrdersByArea(orders) {
    const groups = {};

    orders.forEach((order) => {
      const area = order.recipient?.district || 'default';
      if (!groups[area]) {
        groups[area] = [];
      }
      groups[area].push(order);
    });

    return groups;
  }

  generateRouteSummary(route) {
    if (route.length === 0) {
      return { totalDistance: 0, totalDuration: 0, stops: [] };
    }

    const totalDistance = route.reduce((sum, point) => sum + (point.distanceFromLast || 0), 0);
    const totalDuration = route.reduce((sum, point) => sum + (point.estimatedDuration || 0), 0);

    return {
      totalDistance,
      totalDuration,
      totalStops: route.length,
      stops: route.map((point, index) => ({
        orderNo: point.orderNo,
        sequence: index + 1,
        distanceFromLast: point.distanceFromLast,
        estimatedDuration: point.estimatedDuration,
        address: point.address,
      })),
    };
  }
}

module.exports = new RoutePlannerService();
