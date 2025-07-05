import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://localhost:3000/api';

  // Login
  static Future<Map<String, dynamic>> login(
    String email,
    String password,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Login failed');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Create enrollment
  static Future<Map<String, dynamic>> createEnrollment(
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/enrollment/create'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(data),
      );

      if (response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        throw Exception('Enrollment failed');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Get enrollments
  static Future<List<Map<String, dynamic>>> getEnrollments() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/enrollment/list'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.cast<Map<String, dynamic>>();
      } else {
        throw Exception('Failed to load enrollments');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
}
