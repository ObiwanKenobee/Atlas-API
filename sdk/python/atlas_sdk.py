import requests

class AtlasClient:
    def __init__(self, base_url, api_key=None):
        self.base = base_url.rstrip('/')
        self.headers = {'Authorization': f'Bearer {api_key}'} if api_key else {}

    def issue_credential(self, payload):
        return requests.post(f"{self.base}/v1/vrc/issue", json=payload, headers=self.headers).json()

    def verify_credential(self, payload):
        return requests.post(f"{self.base}/v1/vrc/verify", json=payload, headers=self.headers).json()

    def register_sensor(self, payload):
        return requests.post(f"{self.base}/v1/oracle/sensors", json=payload, headers=self.headers).json()

    def submit_measurement(self, sensor_id, payload):
        return requests.post(f"{self.base}/v1/oracle/sensors/{sensor_id}/measurements", json=payload, headers=self.headers).json()

    def submit_activation(self, payload):
        return requests.post(f"{self.base}/v1/rve/activations", json=payload, headers=self.headers).json()
