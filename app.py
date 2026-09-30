from flask import Flask, render_template, jsonify, request
from datetime import datetime

app = Flask(__name__)

MOCK_DATA = {
    "expeditions": [
        {
            "id": "EXP-001", "name": "Bharati Station Resupply", "destination": "Bharati Station", 
            "start_date": "2026-10-15", "end_date": "2026-11-20", "team_size": 12,
            "status": "In Progress", "priority": "High", "progress": 45,
            "mission": "Annual resupply of critical fuel and food rations before winter sets in.",
            "assigned_personnel": ["P-401", "P-405", "P-410", "P-415"], "assigned_assets": ["VEH-12", "VEH-13"], "required_cargo": ["CRG-1001", "CRG-1004", "CRG-1009"]
        },
        {
            "id": "EXP-002", "name": "Maitri Inland Traverse", "destination": "Maitri Station", 
            "start_date": "2026-11-05", "end_date": "2026-12-10", "team_size": 8,
            "status": "Planned", "priority": "Medium", "progress": 0,
            "mission": "Scientific traverse to collect ice cores and maintain weather stations.",
            "assigned_personnel": ["P-402", "P-411", "P-416"], "assigned_assets": ["VEH-08", "VEH-14"], "required_cargo": ["CRG-1002", "CRG-1011"]
        },
        {
            "id": "EXP-003", "name": "Ice Core Sampling", "destination": "Field Camp Alpha", 
            "start_date": "2026-08-20", "end_date": "2026-09-10", "team_size": 5,
            "status": "Completed", "priority": "Low", "progress": 100,
            "mission": "Deep ice drilling for paleoclimate research.",
            "assigned_personnel": ["P-412", "P-417"], "assigned_assets": ["EQP-44", "EQP-45"], "required_cargo": []
        },
        {
            "id": "EXP-004", "name": "Polar Oceanographic Survey", "destination": "Indian Ocean",
            "start_date": "2026-12-01", "end_date": "2027-02-15", "team_size": 24,
            "status": "Planned", "priority": "Medium", "progress": 0,
            "mission": "Marine biology and ocean current mapping off the coast of Antarctica.",
            "assigned_personnel": ["P-403", "P-413", "P-418"], "assigned_assets": ["VEH-15"], "required_cargo": ["CRG-1005", "CRG-1012"]
        },
        {
            "id": "EXP-005", "name": "Emergency Resupply Mission", "destination": "Bharati Station",
            "start_date": "2026-09-25", "end_date": "2026-10-05", "team_size": 4,
            "status": "In Progress", "priority": "Critical", "progress": 80,
            "mission": "Airdrop of critical medical supplies and generator parts.",
            "assigned_personnel": ["P-404", "P-414"], "assigned_assets": ["VEH-16"], "required_cargo": ["CRG-1003", "CRG-1006"]
        },
        {
            "id": "EXP-006", "name": "Atmospheric Research Expedition", "destination": "Maitri Station",
            "start_date": "2026-01-10", "end_date": "2026-03-20", "team_size": 6,
            "status": "Completed", "priority": "Medium", "progress": 100,
            "mission": "Deployment of atmospheric balloons for ozone layer monitoring.",
            "assigned_personnel": ["P-406", "P-407"], "assigned_assets": ["EQP-46"], "required_cargo": []
        },
        {
            "id": "EXP-007", "name": "Winter Scientific Traverse", "destination": "Field Camp Bravo",
            "start_date": "2027-05-01", "end_date": "2027-08-30", "team_size": 10,
            "status": "Planned", "priority": "High", "progress": 0,
            "mission": "Over-winter seismic monitoring deep inland.",
            "assigned_personnel": ["P-408", "P-409"], "assigned_assets": ["VEH-17", "EQP-47"], "required_cargo": ["CRG-1013", "CRG-1014"]
        },
        {
            "id": "EXP-008", "name": "Ice Shelf Monitoring Mission", "destination": "Bharati Station",
            "start_date": "2026-10-01", "end_date": "2026-12-30", "team_size": 7,
            "status": "In Progress", "priority": "Medium", "progress": 20,
            "mission": "Install ground penetrating radar arrays on coastal ice shelves.",
            "assigned_personnel": ["P-419", "P-420"], "assigned_assets": ["EQP-48"], "required_cargo": ["CRG-1007", "CRG-1008"]
        }
    ],
    "inventory": [
        { "id": "INV-101", "name": "Arctic Diesel", "category": "Fuel", "location": "Maitri Station", "quantity": 45000, "unit": "L", "daily_consumption": 1500, "min_safe_level": 10000, "recent_consumption": 1400 },
        { "id": "INV-102", "name": "Food Rations", "category": "Food", "location": "Bharati Station", "quantity": 12000, "unit": "kg", "daily_consumption": 50, "min_safe_level": 2000, "recent_consumption": 55 },
        { "id": "INV-103", "name": "Emergency Medical Kit", "category": "Medical", "location": "Maitri Station", "quantity": 10, "unit": "kits", "daily_consumption": 0.1, "min_safe_level": 5, "recent_consumption": 0 },
        { "id": "INV-104", "name": "Generator Spare Parts", "category": "Spare Parts", "location": "Bharati Station", "quantity": 2, "unit": "boxes", "daily_consumption": 0.05, "min_safe_level": 5, "recent_consumption": 0.5 },
        { "id": "INV-105", "name": "Liquid Oxygen", "category": "Oxygen", "location": "Maitri Station", "quantity": 500, "unit": "L", "daily_consumption": 100, "min_safe_level": 200, "recent_consumption": 110 },
        { "id": "INV-106", "name": "Scientific Reagents", "category": "Scientific Supplies", "location": "Bharati Station", "quantity": 0, "unit": "bottles", "daily_consumption": 2, "min_safe_level": 10, "recent_consumption": 5 },
        { "id": "INV-107", "name": "Thermal Suits", "category": "Safety Equipment", "location": "Goa", "quantity": 150, "unit": "suits", "daily_consumption": 0.5, "min_safe_level": 50, "recent_consumption": 2 },
        { "id": "INV-108", "name": "Aviation Turbine Fuel", "category": "Fuel", "location": "Bharati Station", "quantity": 20000, "unit": "L", "daily_consumption": 500, "min_safe_level": 5000, "recent_consumption": 450 },
        { "id": "INV-109", "name": "Dehydrated Vegetables", "category": "Food", "location": "Maitri Station", "quantity": 5000, "unit": "kg", "daily_consumption": 30, "min_safe_level": 1000, "recent_consumption": 30 },
        { "id": "INV-110", "name": "Antibiotics Broad Spectrum", "category": "Medical", "location": "Bharati Station", "quantity": 25, "unit": "boxes", "daily_consumption": 0.2, "min_safe_level": 15, "recent_consumption": 0.1 },
        { "id": "INV-111", "name": "Snowcat Tracks", "category": "Spare Parts", "location": "Maitri Station", "quantity": 8, "unit": "sets", "daily_consumption": 0.01, "min_safe_level": 2, "recent_consumption": 0 },
        { "id": "INV-112", "name": "Helium Gas Cylinders", "category": "Scientific Supplies", "location": "Maitri Station", "quantity": 12, "unit": "cylinders", "daily_consumption": 1.5, "min_safe_level": 15, "recent_consumption": 1.2 },
        { "id": "INV-113", "name": "High-Calorie Chocolate", "category": "Food", "location": "Field Camp Alpha", "quantity": 50, "unit": "kg", "daily_consumption": 5, "min_safe_level": 20, "recent_consumption": 6 },
        { "id": "INV-114", "name": "Satellite Phone Batteries", "category": "Spare Parts", "location": "Bharati Station", "quantity": 100, "unit": "units", "daily_consumption": 1, "min_safe_level": 30, "recent_consumption": 2 },
        { "id": "INV-115", "name": "Oxygen Concentrator Filters", "category": "Medical", "location": "Maitri Station", "quantity": 15, "unit": "packs", "daily_consumption": 0.1, "min_safe_level": 10, "recent_consumption": 0 },
        { "id": "INV-116", "name": "Ice Core Storage Tubes", "category": "Scientific Supplies", "location": "Field Camp Alpha", "quantity": 300, "unit": "tubes", "daily_consumption": 10, "min_safe_level": 50, "recent_consumption": 12 },
        { "id": "INV-117", "name": "Heating Oil", "category": "Fuel", "location": "Bharati Station", "quantity": 15000, "unit": "L", "daily_consumption": 800, "min_safe_level": 5000, "recent_consumption": 850 }
    ],
    "assets": [
        { "id": "VEH-12", "name": "Snowcat SC-102", "type": "Vehicle", "location": "Bharati Station", "assigned_expedition": "EXP-001", "assigned_team": "Science Team Alpha", "condition": "Good", "operational_status": "Operational", "usage_hours": 320, "last_maintenance": "2026-06-15", "next_maintenance": "2026-11-15", "max_hours": 400 },
        { "id": "VEH-08", "name": "Helicopter VT-H1", "type": "Vehicle", "location": "Maitri Station", "assigned_expedition": "EXP-002", "assigned_team": "Logistics Team", "condition": "Fair", "operational_status": "Maintenance Due", "usage_hours": 1200, "last_maintenance": "2025-10-01", "next_maintenance": "2026-04-01", "max_hours": 1000 },
        { "id": "VEH-13", "name": "Icebreaker Support Vehicle", "type": "Vehicle", "location": "Cape Town", "assigned_expedition": "EXP-001", "assigned_team": "Logistics Team", "condition": "Excellent", "operational_status": "Operational", "usage_hours": 45, "last_maintenance": "2026-08-10", "next_maintenance": "2027-08-10", "max_hours": 500 },
        { "id": "EQP-44", "name": "Weather Station WX-1", "type": "Scientific Equipment", "location": "Field Camp Alpha", "assigned_expedition": "EXP-003", "assigned_team": "Science Team Alpha", "condition": "Poor", "operational_status": "At Risk", "usage_hours": 2100, "last_maintenance": "2024-12-01", "next_maintenance": "2025-12-01", "max_hours": 2000 },
        { "id": "EQP-45", "name": "SatCom Unit 4", "type": "Communications", "location": "Bharati Station", "assigned_expedition": "EXP-003", "assigned_team": "Ops Team", "condition": "Critical", "operational_status": "Out of Service", "usage_hours": 8000, "last_maintenance": "2026-01-10", "next_maintenance": "2026-07-10", "max_hours": 5000 },
        { "id": "VEH-14", "name": "Fuel Transport Vehicle", "type": "Vehicle", "location": "Maitri Station", "assigned_expedition": "EXP-002", "assigned_team": "Logistics Team", "condition": "Good", "operational_status": "Operational", "usage_hours": 150, "last_maintenance": "2026-05-12", "next_maintenance": "2026-11-12", "max_hours": 300 },
        { "id": "EQP-46", "name": "Scientific Drill SD-2", "type": "Scientific Equipment", "location": "Bharati Station", "assigned_expedition": "EXP-006", "assigned_team": "Science Team Alpha", "condition": "Fair", "operational_status": "Operational", "usage_hours": 90, "last_maintenance": "2026-01-15", "next_maintenance": "2026-07-15", "max_hours": 150 },
        { "id": "VEH-15", "name": "Research Vessel Polar Explorer", "type": "Vehicle", "location": "Indian Ocean", "assigned_expedition": "EXP-004", "assigned_team": "Marine Biology Team", "condition": "Good", "operational_status": "Operational", "usage_hours": 4500, "last_maintenance": "2026-03-10", "next_maintenance": "2027-03-10", "max_hours": 6000 },
        { "id": "VEH-16", "name": "C-130 Hercules Aircraft", "type": "Vehicle", "location": "Cape Town", "assigned_expedition": "EXP-005", "assigned_team": "Air Support", "condition": "Excellent", "operational_status": "Operational", "usage_hours": 1200, "last_maintenance": "2026-08-01", "next_maintenance": "2027-02-01", "max_hours": 2500 },
        { "id": "EQP-47", "name": "Emergency Shelter Tent A", "type": "Safety Equipment", "location": "Field Camp Bravo", "assigned_expedition": "EXP-007", "assigned_team": "Traverse Team", "condition": "Fair", "operational_status": "Operational", "usage_hours": 720, "last_maintenance": "2025-11-20", "next_maintenance": "2026-11-20", "max_hours": 2000 },
        { "id": "VEH-17", "name": "Heavy Tractor PistenBully", "type": "Vehicle", "location": "Maitri Station", "assigned_expedition": "EXP-007", "assigned_team": "Traverse Team", "condition": "Poor", "operational_status": "Maintenance Due", "usage_hours": 1950, "last_maintenance": "2025-12-10", "next_maintenance": "2026-05-10", "max_hours": 2000 },
        { "id": "EQP-48", "name": "Ground Penetrating Radar Array", "type": "Scientific Equipment", "location": "Bharati Station", "assigned_expedition": "EXP-008", "assigned_team": "Glaciology Team", "condition": "Good", "operational_status": "Operational", "usage_hours": 45, "last_maintenance": "2026-09-05", "next_maintenance": "2027-03-05", "max_hours": 500 }
    ],
    "cargo": [
        { "id": "CRG-1001", "name": "Scientific Core Drills", "category": "Scientific Instruments", "weight": "2,500 kg", "origin": "Goa", "current_location": "Cape Town", "destination": "Bharati Station", "transport": "Vessel", "dispatch_date": "2026-09-01", "expected_arrival": "2026-10-15", "status": "In Transit", "priority": "High", "progress": 55, "stage": 3 },
        { "id": "CRG-1002", "name": "Winter Thermal Suits", "category": "Winter Clothing", "weight": "450 kg", "origin": "Goa", "current_location": "Indian Ocean", "destination": "Maitri Station", "transport": "Vessel", "dispatch_date": "2026-09-15", "expected_arrival": "2026-10-30", "status": "Delayed", "priority": "Medium", "progress": 30, "stage": 2 },
        { "id": "CRG-1003", "name": "Emergency Medical Kit", "category": "Medical Supplies", "weight": "50 kg", "origin": "Cape Town", "current_location": "Bharati Station", "destination": "Bharati Station", "transport": "Air", "dispatch_date": "2026-09-20", "expected_arrival": "2026-09-22", "status": "Delivered", "priority": "Critical", "progress": 100, "stage": 6 },
        { "id": "CRG-1004", "name": "Generator Fuel", "category": "Fuel", "weight": "15,000 kg", "origin": "Goa", "current_location": "Goa Port", "destination": "Field Camp Alpha", "transport": "Vessel", "dispatch_date": "2026-10-01", "expected_arrival": "2026-11-20", "status": "Planned", "priority": "Medium", "progress": 10, "stage": 1 },
        { "id": "CRG-1005", "name": "Marine Sonar Array", "category": "Scientific Instruments", "weight": "1,200 kg", "origin": "Cape Town", "current_location": "Cape Town Port", "destination": "Indian Ocean", "transport": "Vessel", "dispatch_date": "2026-11-15", "expected_arrival": "2026-12-01", "status": "At Origin", "priority": "Medium", "progress": 5, "stage": 1 },
        { "id": "CRG-1006", "name": "Antibiotics and Vaccines", "category": "Medical Supplies", "weight": "120 kg", "origin": "Goa", "current_location": "Goa Airport", "destination": "Maitri Station", "transport": "Air", "dispatch_date": "2026-09-28", "expected_arrival": "2026-09-30", "status": "In Transit", "priority": "Critical", "progress": 40, "stage": 2 },
        { "id": "CRG-1007", "name": "Dehydrated Food Rations", "category": "Food", "weight": "3,000 kg", "origin": "Cape Town", "current_location": "Antarctica Ice Shelf", "destination": "Bharati Station", "transport": "Helicopter", "dispatch_date": "2026-09-25", "expected_arrival": "2026-09-29", "status": "Delayed", "priority": "High", "progress": 80, "stage": 4 },
        { "id": "CRG-1008", "name": "SatCom Antenna Array", "category": "Communication Equipment", "weight": "850 kg", "origin": "Goa", "current_location": "Cape Town", "destination": "Bharati Station", "transport": "Vessel", "dispatch_date": "2026-09-10", "expected_arrival": "2026-10-25", "status": "Customs", "priority": "High", "progress": 50, "stage": 3 },
        { "id": "CRG-1009", "name": "Helicopter Rotor Blades", "category": "Spare Parts", "weight": "400 kg", "origin": "Cape Town", "current_location": "Cape Town", "destination": "Maitri Station", "transport": "Vessel", "dispatch_date": "2026-10-05", "expected_arrival": "2026-11-05", "status": "Planned", "priority": "Medium", "progress": 15, "stage": 1 },
        { "id": "CRG-1010", "name": "Oxygen Cylinders", "category": "Oxygen", "weight": "1,500 kg", "origin": "Goa", "current_location": "Maitri Station", "destination": "Maitri Station", "transport": "Vessel", "dispatch_date": "2026-08-01", "expected_arrival": "2026-09-15", "status": "Delivered", "priority": "High", "progress": 100, "stage": 6 },
        { "id": "CRG-1011", "name": "Meteorological Balloons", "category": "Scientific Instruments", "weight": "250 kg", "origin": "Cape Town", "current_location": "Indian Ocean", "destination": "Maitri Station", "transport": "Vessel", "dispatch_date": "2026-09-22", "expected_arrival": "2026-10-18", "status": "In Transit", "priority": "Low", "progress": 45, "stage": 2 },
        { "id": "CRG-1012", "name": "Ice Core Storage Freezers", "category": "Equipment", "weight": "4,200 kg", "origin": "Goa", "current_location": "Cape Town", "destination": "Field Camp Alpha", "transport": "Vessel", "dispatch_date": "2026-09-05", "expected_arrival": "2026-10-20", "status": "In Transit", "priority": "High", "progress": 60, "stage": 3 }
    ],
    "personnel": [
        { "id": "P-401", "name": "Dr. A. Sharma", "role": "Expedition Leader", "team": "Science Team Alpha", "current_location": "Bharati Station", "destination": "Bharati Station", "movement_status": "Antarctica", "deployment_date": "2026-05-10", "return_date": "2027-03-15", "emergency_status": "Normal", "stage": 4 },
        { "id": "P-402", "name": "Capt. R. Singh", "role": "Logistics Officer", "team": "Logistics Team", "current_location": "Cape Town", "destination": "Maitri Station", "movement_status": "Travelling", "deployment_date": "2026-09-25", "return_date": "2027-04-10", "emergency_status": "Normal", "stage": 2 },
        { "id": "P-403", "name": "Dr. K. Patel", "role": "Doctor", "team": "Medical Unit", "current_location": "Goa", "destination": "Bharati Station", "movement_status": "At Base", "deployment_date": "2026-11-01", "return_date": "2027-05-20", "emergency_status": "Normal", "stage": 1 },
        { "id": "P-404", "name": "E. Verma", "role": "Technician", "team": "Maintenance Squad", "current_location": "Maitri Station", "destination": "Maitri Station", "movement_status": "Antarctica", "deployment_date": "2025-12-05", "return_date": "2026-12-10", "emergency_status": "Alert", "stage": 4 },
        { "id": "P-405", "name": "S. Patel", "role": "Communications Officer", "team": "Ops Team", "current_location": "Cape Town", "destination": "Bharati Station", "movement_status": "Travelling", "deployment_date": "2026-09-28", "return_date": "2027-03-30", "emergency_status": "Normal", "stage": 2 },
        { "id": "P-406", "name": "Dr. L. Chen", "role": "Scientist", "team": "Atmos-Research", "current_location": "Goa", "destination": "Maitri Station", "movement_status": "Returned", "deployment_date": "2026-01-10", "return_date": "2026-03-25", "emergency_status": "Normal", "stage": 5 },
        { "id": "P-407", "name": "M. Oksanen", "role": "Research Assistant", "team": "Atmos-Research", "current_location": "Goa", "destination": "Maitri Station", "movement_status": "Returned", "deployment_date": "2026-01-10", "return_date": "2026-03-25", "emergency_status": "Normal", "stage": 5 },
        { "id": "P-408", "name": "J. Dupont", "role": "Expedition Leader", "team": "Traverse Team", "current_location": "Goa", "destination": "Field Camp Bravo", "movement_status": "At Base", "deployment_date": "2027-04-15", "return_date": "2027-09-10", "emergency_status": "Normal", "stage": 1 },
        { "id": "P-409", "name": "T. Rossi", "role": "Engineer", "team": "Traverse Team", "current_location": "Goa", "destination": "Field Camp Bravo", "movement_status": "At Base", "deployment_date": "2027-04-15", "return_date": "2027-09-10", "emergency_status": "Normal", "stage": 1 },
        { "id": "P-410", "name": "Dr. V. Gupta", "role": "Scientist", "team": "Science Team Alpha", "current_location": "Bharati Station", "destination": "Bharati Station", "movement_status": "Antarctica", "deployment_date": "2026-05-15", "return_date": "2027-03-10", "emergency_status": "Normal", "stage": 4 },
        { "id": "P-411", "name": "F. Muller", "role": "Technician", "team": "Logistics Team", "current_location": "Indian Ocean", "destination": "Maitri Station", "movement_status": "Travelling", "deployment_date": "2026-09-20", "return_date": "2027-04-05", "emergency_status": "Delayed", "stage": 3 },
        { "id": "P-412", "name": "S. Tanaka", "role": "Scientist", "team": "Ice Core Team", "current_location": "Cape Town", "destination": "Goa", "movement_status": "Returning", "deployment_date": "2026-08-15", "return_date": "2026-09-25", "emergency_status": "Normal", "stage": 2 },
        { "id": "P-413", "name": "A. Ivanova", "role": "Scientist", "team": "Marine Biology Team", "current_location": "Goa", "destination": "Indian Ocean", "movement_status": "At Base", "deployment_date": "2026-11-20", "return_date": "2027-02-20", "emergency_status": "Normal", "stage": 1 },
        { "id": "P-414", "name": "R. Kumar", "role": "Safety Officer", "team": "Air Support", "current_location": "Cape Town", "destination": "Bharati Station", "movement_status": "Travelling", "deployment_date": "2026-09-24", "return_date": "2026-10-10", "emergency_status": "Normal", "stage": 2 },
        { "id": "P-415", "name": "L. Silva", "role": "Engineer", "team": "Science Team Alpha", "current_location": "Bharati Station", "destination": "Bharati Station", "movement_status": "Antarctica", "deployment_date": "2026-05-10", "return_date": "2027-03-15", "emergency_status": "Normal", "stage": 4 }
    ],
    "emergencies": [
        { "id": "EM-001", "type": "Medical Emergency", "location": "Field Camp Alpha", "severity": "High", "status": "Responding", "reporter": "Dr. Sarah", "timestamp": "2026-09-30 08:15", "description": "Personnel suffering from severe frostbite, requires immediate evacuation.", "people_affected": 1, "assigned_team": "Medical Team Alpha", "available_asset": "Snowcat SC-102" },
        { "id": "EM-002", "type": "Extreme Weather", "location": "Bharati Station", "severity": "Critical", "status": "Assessed", "reporter": "Auto Station", "timestamp": "2026-09-30 11:00", "description": "Category 5 Blizzard approaching, external operations suspended.", "people_affected": 24, "assigned_team": "Station Command", "available_asset": "None" },
        { "id": "EM-003", "type": "Vehicle Breakdown", "location": "Maitri Station", "severity": "Medium", "status": "Team Dispatched", "reporter": "Logistics Lead", "timestamp": "2026-09-30 10:30", "description": "Fuel Transport Vehicle engine failure 5km from station.", "people_affected": 2, "assigned_team": "Rescue Team Bravo", "available_asset": "Snowcat SC-101" },
        { "id": "EM-004", "type": "Communication Failure", "location": "Cape Town", "severity": "Low", "status": "Resolved", "reporter": "Ops Desk", "timestamp": "2026-09-29 14:00", "description": "SatCom uplink lost for 2 hours.", "people_affected": 0, "assigned_team": "IT Support", "available_asset": "SatCom Unit 4" },
        { "id": "EM-005", "type": "Power Failure", "location": "Maitri Station", "severity": "High", "status": "Reported", "reporter": "E. Verma", "timestamp": "2026-09-30 13:45", "description": "Main generator GEN-5 failed. Operating on backup power.", "people_affected": 18, "assigned_team": "Maintenance Squad", "available_asset": "Generator Spare Parts" },
        { "id": "EM-006", "type": "Supply Delay", "location": "Indian Ocean", "severity": "Medium", "status": "Assessed", "reporter": "Logistics Officer", "timestamp": "2026-09-30 09:20", "description": "Vessel carrying Winter Thermal Suits delayed by pack ice.", "people_affected": 0, "assigned_team": "Marine Route Planners", "available_asset": "Icebreaker Support Vehicle" },
        { "id": "EM-007", "type": "Fuel Leak", "location": "Bharati Station", "severity": "Critical", "status": "Responding", "reporter": "Safety Officer", "timestamp": "2026-09-30 12:10", "description": "Secondary fuel tank leaking heating oil near living quarters.", "people_affected": 12, "assigned_team": "Hazmat Team", "available_asset": "Containment Kit" }
    ]
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data')
def get_data():
    return jsonify(MOCK_DATA)

@app.route('/api/expeditions', methods=['POST'])
def add_expedition():
    data = request.json
    new_id = f"EXP-{len(MOCK_DATA['expeditions']) + 1:03d}"
    
    new_exp = {
        "id": new_id,
        "name": data.get("name"),
        "destination": data.get("destination"),
        "start_date": data.get("start_date"),
        "end_date": data.get("end_date"),
        "team_size": int(data.get("team_size", 0)),
        "status": "Planned",
        "priority": data.get("priority", "Medium"),
        "progress": 0,
        "mission": data.get("mission", ""),
        "assigned_personnel": [],
        "assigned_assets": [],
        "required_cargo": []
    }
    MOCK_DATA["expeditions"].insert(0, new_exp)
    return jsonify(new_exp)

@app.route('/api/cargo', methods=['POST'])
def add_cargo():
    data = request.json
    new_id = f"CRG-{len(MOCK_DATA['cargo']) + 1001}"
    
    new_cargo = {
        "id": new_id,
        "name": data.get("name"),
        "category": data.get("category"),
        "weight": data.get("weight"),
        "origin": data.get("origin"),
        "current_location": data.get("origin"),
        "destination": data.get("destination"),
        "transport": data.get("transport"),
        "dispatch_date": datetime.now().strftime('%Y-%m-%d'),
        "expected_arrival": data.get("expected_arrival"),
        "status": "In Transit",
        "priority": data.get("priority", "Medium"),
        "progress": 5,
        "stage": 1 # Dispatched
    }
    MOCK_DATA["cargo"].insert(0, new_cargo)
    return jsonify(new_cargo)

@app.route('/api/inventory/<item_id>', methods=['PUT'])
def update_inventory(item_id):
    data = request.json
    for item in MOCK_DATA["inventory"]:
        if item["id"] == item_id:
            if "add_quantity" in data and data["add_quantity"]:
                item["quantity"] += float(data["add_quantity"])
            if "record_consumption" in data and data["record_consumption"]:
                item["quantity"] -= float(data["record_consumption"])
                item["recent_consumption"] = float(data["record_consumption"])
                # Prevent negative stock
                if item["quantity"] < 0:
                    item["quantity"] = 0
            return jsonify(item)
    return jsonify({"error": "Item not found"}), 404

@app.route('/api/personnel', methods=['POST'])
def add_personnel():
    data = request.json
    new_id = f"P-{len(MOCK_DATA['personnel']) + 401:03d}"
    
    new_person = {
        "id": new_id,
        "name": data.get("name"),
        "role": data.get("role"),
        "team": data.get("team"),
        "current_location": data.get("current_location"),
        "destination": data.get("destination"),
        "movement_status": data.get("movement_status", "At Base"),
        "deployment_date": data.get("deployment_date"),
        "return_date": data.get("return_date"),
        "emergency_status": "Normal",
        "stage": int(data.get("stage", 0))
    }
    MOCK_DATA["personnel"].insert(0, new_person)
    return jsonify(new_person)

@app.route('/api/personnel/<pid>', methods=['PUT'])
def update_personnel(pid):
    data = request.json
    for p in MOCK_DATA["personnel"]:
        if p["id"] == pid:
            if "current_location" in data:
                p["current_location"] = data["current_location"]
            if "movement_status" in data:
                p["movement_status"] = data["movement_status"]
            if "emergency_status" in data:
                p["emergency_status"] = data["emergency_status"]
            if "stage" in data:
                p["stage"] = int(data["stage"])
            return jsonify(p)
    return jsonify({"error": "Personnel not found"}), 404

@app.route('/api/assets/<aid>', methods=['PUT'])
def update_asset(aid):
    data = request.json
    for a in MOCK_DATA["assets"]:
        if a["id"] == aid:
            if "location" in data:
                a["location"] = data["location"]
            if "condition" in data:
                a["condition"] = data["condition"]
            if "status" in data:
                a["operational_status"] = data["status"]
            if "usage_hours" in data:
                a["usage_hours"] = int(data["usage_hours"])
            if "last_maintenance" in data:
                a["last_maintenance"] = data["last_maintenance"]
            if "next_maintenance" in data:
                a["next_maintenance"] = data["next_maintenance"]
            
            # Recalculate risk automatically
            if a["operational_status"] in ["At Risk", "Out of Service"] or a["condition"] in ["Poor", "Critical"]:
                a["risk_level"] = "High"
            elif a["operational_status"] == "Maintenance Due" or a["usage_hours"] > a.get("max_hours", 1000) * 0.9:
                a["risk_level"] = "Medium"
            else:
                a["risk_level"] = "Low"
                
            return jsonify(a)
    return jsonify({"error": "Asset not found"}), 404

@app.route('/api/emergencies', methods=['POST'])
def add_emergency():
    data = request.json
    new_id = f"EM-{len(MOCK_DATA['emergencies']) + 1:03d}"
    new_emergency = {
        "id": new_id,
        "type": data.get("type", "General Incident"),
        "location": data.get("location", "Unknown"),
        "severity": data.get("severity", "Medium"),
        "status": "Reported",
        "reporter": data.get("reporter", "System"),
        "timestamp": data.get("timestamp", "2026-09-30 12:00"),
        "description": data.get("description", ""),
        "people_affected": int(data.get("people_affected", 0)),
        "assigned_team": data.get("assigned_team", "Pending"),
        "available_asset": data.get("available_asset", "None")
    }
    MOCK_DATA["emergencies"].insert(0, new_emergency)
    return jsonify(new_emergency), 201

@app.route('/api/emergencies/<eid>', methods=['PUT'])
def update_emergency(eid):
    data = request.json
    for em in MOCK_DATA["emergencies"]:
        if em["id"] == eid:
            if "status" in data:
                em["status"] = data["status"]
            if "assigned_team" in data:
                em["assigned_team"] = data["assigned_team"]
            if "available_asset" in data:
                em["available_asset"] = data["available_asset"]
            return jsonify(em)
    return jsonify({"error": "Emergency not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='127.0.0.1')
