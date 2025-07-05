export interface CassiniMissionData {
  timestamp: string;
  power_consumption_w: number;
  "battery_level_%": number;
  data_storage_usage_mb: number;
  thermal_health: string;
  propulsion_health: string;
  communication_health: string;
  attitude_control_health: string;
  orbital_position_x_km: number;
  orbital_position_y_km: number;
  orbital_position_z_km: number;
  ground_station_visibility: string;
  task_id: number;
  task_type: string;
  task_priority: string;
  execution_duration_min: number;
  power_used_w: number;
  memory_used_mb: number;
  bandwidth_used_mbps: number;
  task_success: string;
  anomaly_id: number | null;
  anomaly_type: string | null;
  duration_min: number | null;
  recovery_action: string | null;
  impact_on_tasks: string | null;
}

export interface SatelliteCoordinationData {
  timestamp: string;
  satellite_id: string;
  ground_station: string;
  inter_satellite_link: string;
  bandwidth_used_mbps: number;
  available_bandwidth_mbps: number;
  conflict_status: string;
  conflict_resolution: string;
  weather_condition: string;
  priority: string;
  orbital_position_x_km: number;
  orbital_position_y_km: number;
  orbital_position_z_km: number;
  throughput_mbps: number;
}