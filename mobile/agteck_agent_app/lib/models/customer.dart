class Customer {
  final String id;
  final String name;
  final String phone;
  final String? email;
  final String address;
  final DateTime createdAt;

  Customer({
    required this.id,
    required this.name,
    required this.phone,
    this.email,
    required this.address,
    required this.createdAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'email': email,
      'address': address,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory Customer.fromJson(Map<String, dynamic> json) {
    return Customer(
      id: json['id'],
      name: json['name'],
      phone: json['phone'],
      email: json['email'],
      address: json['address'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
