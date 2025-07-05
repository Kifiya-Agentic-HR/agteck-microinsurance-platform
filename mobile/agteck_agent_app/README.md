# Agteck Agent Mobile App

A simple Flutter mobile application for Agteck Microinsurance agents to enroll customers.

## 📁 Simple Project Structure

```
lib/
├── main.dart                    # App entry point
├── screens/                     # All app screens
│   ├── splash/                  # Splash screen
│   ├── login/                   # Login screen
│   ├── home/                    # Home dashboard
│   ├── enrollment/              # Customer enrollment
│   └── onboarding/              # Onboarding (future)
├── services/                    # API and storage services
│   ├── api/                     # API calls
│   └── storage/                 # Local storage
├── models/                      # Data models
├── widgets/                     # Reusable widgets
└── utils/                       # Utility functions
```

## 🚀 Features

- **Splash Screen**: App loading and branding
- **Login**: Agent authentication
- **Home Dashboard**: Main menu with quick actions
- **Customer Enrollment**: Form to enroll new customers
- **API Integration**: Connect to your backend services
- **Local Storage**: Save user data and tokens

## 🛠️ Setup

### Prerequisites

- Flutter SDK (3.0.0 or higher)
- Android Studio / VS Code

### Installation

1. **Install Dependencies**

   ```bash
   flutter pub get
   ```

2. **Run the App**
   ```bash
   flutter run
   ```

## 📱 Screens

### 1. Splash Screen

- Shows app logo and branding
- Automatically navigates to login after 3 seconds

### 2. Login Screen

- Email and password fields
- Form validation
- Navigates to home dashboard on successful login

### 3. Home Dashboard

- Welcome message
- Grid menu with quick actions:
  - Enroll Customer
  - View Enrollments
  - Reports
  - Settings

### 4. Customer Enrollment

- Customer information form
- Required fields: Name, Phone, Address
- Optional field: Email
- Form validation
- Success message on completion

## 🔧 Configuration

### API Configuration

Update the base URL in `lib/services/api/api_service.dart`:

```dart
static const String baseUrl = 'http://your-api-gateway-url/api';
```

### Available API Endpoints

- `POST /auth/login` - Agent login
- `POST /enrollment/create` - Create customer enrollment
- `GET /enrollment/list` - Get all enrollments

## 📦 Dependencies

- **http**: For API calls
- **shared_preferences**: Local data storage
- **cupertino_icons**: UI icons

## 🎯 Next Steps

1. **Connect to Your API**: Update the base URL and endpoints
2. **Add Authentication**: Implement proper token management
3. **Add More Features**:
   - View enrollments list
   - Reports and analytics
   - Settings page
4. **Add Images**: Place app logo and icons in `assets/` folder
5. **Testing**: Add unit and widget tests

## 🏗️ Development

This is a simple, clean structure that's easy to understand and extend. Each screen is self-contained and the services handle all external communication.

## 📞 Support

For questions and support, contact the development team.
