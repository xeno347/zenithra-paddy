export type DummyFleetTask = {
  id: string;
  location_name: string;
  status: 'active' | 'completed' | 'pending';
  type: 'farm' | 'hub' | 'maintenance';
  farm_id?: string;
};

export type DummyFleetDaySchedule = {
  plan_id?: string;
  date: string;
  tasks: DummyFleetTask[];
  fuel: { input: number; consumed: number };
  initialEngineHours: number;
  finalEngineHours: number;
  damageChecklist: string;
  totalDistance: number;
  tasksStatus: 'completed' | 'pending' | 'partial';
  isLocked: boolean;
  damageChecklistTouched: boolean;
};

export type DummyFleetScheduleMap = Record<string, Record<string, DummyFleetDaySchedule>>;

export type DummyFleetVehicle = {
  vehicle_id: string;
  vehicle_information: {
    vehicle_number: string;
    type: string;
  };
  driver: {
    name: string;
    phone: string;
    checkedIn: boolean;
  };
  currentFuelLevel: number;
};

export const USE_DUMMY_FLEET_DATA = true;

const formatDateKey = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const getDummyFleetData = (): {
  vehicles: DummyFleetVehicle[];
  schedule: DummyFleetScheduleMap;
} => {
  const vehicles: DummyFleetVehicle[] = [
    {
      vehicle_id: 'V-101',
      vehicle_information: { vehicle_number: 'MH12-TR-1001', type: 'Tractor' },
      driver: { name: 'Ravi Shinde', phone: '+91 9876543210', checkedIn: true },
      currentFuelLevel: 72,
    },
    {
      vehicle_id: 'V-102',
      vehicle_information: { vehicle_number: 'MH14-TR-1002', type: 'Tractor' },
      driver: { name: 'Amit Pawar', phone: '+91 9822113344', checkedIn: false },
      currentFuelLevel: 38,
    },
    {
      vehicle_id: 'V-103',
      vehicle_information: { vehicle_number: 'MH04-TR-1003', type: 'Carrier' },
      driver: { name: 'Sagar Patil', phone: '+91 9819901122', checkedIn: true },
      currentFuelLevel: 18,
    },
  ];

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const makeDate = (day: number) => formatDateKey(new Date(year, month, day));

  const schedule: DummyFleetScheduleMap = {
    'V-101': {
      [makeDate(3)]: {
        plan_id: 'PLAN-101-03',
        date: makeDate(3),
        tasks: [
          { id: 't-101-1', location_name: 'Farm A (Nashik)', status: 'completed', type: 'farm', farm_id: 'FARM-A' },
          { id: 't-101-2', location_name: 'Hub Central (Bhiwandi)', status: 'active', type: 'hub' },
        ],
        fuel: { input: 40, consumed: 28 },
        initialEngineHours: 2320,
        finalEngineHours: 2331,
        damageChecklist: '',
        totalDistance: 118,
        tasksStatus: 'partial',
        isLocked: false,
        damageChecklistTouched: true,
      },
      [makeDate(5)]: {
        plan_id: 'PLAN-101-05',
        date: makeDate(5),
        tasks: [
          { id: 't-101-3', location_name: 'Farm C (Palghar)', status: 'pending', type: 'farm', farm_id: 'FARM-C' },
        ],
        fuel: { input: 25, consumed: 0 },
        initialEngineHours: 2332,
        finalEngineHours: 0,
        damageChecklist: '',
        totalDistance: 0,
        tasksStatus: 'pending',
        isLocked: false,
        damageChecklistTouched: false,
      },
    },
    'V-102': {
      [makeDate(2)]: {
        plan_id: 'PLAN-102-02',
        date: makeDate(2),
        tasks: [
          { id: 't-102-1', location_name: 'Farm B (Pune)', status: 'completed', type: 'farm', farm_id: 'FARM-B' },
          { id: 't-102-2', location_name: 'Transit Hub (Thane)', status: 'completed', type: 'hub' },
        ],
        fuel: { input: 30, consumed: 30 },
        initialEngineHours: 1890,
        finalEngineHours: 1900,
        damageChecklist: 'Left mirror minor crack',
        totalDistance: 142,
        tasksStatus: 'completed',
        isLocked: true,
        damageChecklistTouched: true,
      },
      [makeDate(8)]: {
        plan_id: 'PLAN-102-08',
        date: makeDate(8),
        tasks: [
          { id: 't-102-3', location_name: 'Farm D (Alibag)', status: 'active', type: 'farm', farm_id: 'FARM-D' },
        ],
        fuel: { input: 20, consumed: 9 },
        initialEngineHours: 1901,
        finalEngineHours: 0,
        damageChecklist: '',
        totalDistance: 36,
        tasksStatus: 'partial',
        isLocked: false,
        damageChecklistTouched: true,
      },
    },
    'V-103': {
      [makeDate(1)]: {
        plan_id: 'PLAN-103-01',
        date: makeDate(1),
        tasks: [
          { id: 't-103-1', location_name: 'Farm E (Satara)', status: 'completed', type: 'farm', farm_id: 'FARM-E' },
        ],
        fuel: { input: 45, consumed: 39 },
        initialEngineHours: 2765,
        finalEngineHours: 2780,
        damageChecklist: '',
        totalDistance: 167,
        tasksStatus: 'completed',
        isLocked: true,
        damageChecklistTouched: true,
      },
      [makeDate(10)]: {
        plan_id: 'PLAN-103-10',
        date: makeDate(10),
        tasks: [
          { id: 't-103-2', location_name: 'Hub South (Navi Mumbai)', status: 'pending', type: 'hub' },
        ],
        fuel: { input: 15, consumed: 0 },
        initialEngineHours: 2781,
        finalEngineHours: 0,
        damageChecklist: '',
        totalDistance: 0,
        tasksStatus: 'pending',
        isLocked: false,
        damageChecklistTouched: false,
      },
    },
  };

  return { vehicles, schedule };
};
