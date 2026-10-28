import json
from django.test import TestCase


class MazeAPITestCase(TestCase):
    def test_create_maze_endpoint(self):
        payload = {
            "rows": 10,
            "columns": 10,
            "algorithm": "recursive_backtracker"
        }
        response = self.client.post(
            "/api/mazes",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertIn("grid", response_data)
        self.assertEqual(len(response_data["grid"]), 21)
        for i in range(len(response_data["grid"])):
            self.assertEqual(len(response_data["grid"][i]), 21)
        for i in range(len(response_data["grid"])):
            for j in range(len(response_data["grid"][i])):
                if response_data["grid"][i][j] != 1 and response_data["grid"][i][j] != 0:
                    raise AssertionError("Value diffrent form 0 or 1")

    def test_bad_request(self):
        payload = {
            "rows":[1, 2, 3]
            
        }
        response = self.client.post(
            "/api/mazes",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)

    def test_health_endpoint(self):
        payload = {
            "rows": 10,
            "columns": 10,
            "algorithm": "recursive_backtracker"
        }
        response = self.client.post(
            "/health",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
