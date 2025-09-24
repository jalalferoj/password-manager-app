import SwiftUI
import LocalAuthentication

struct AuthenticationView: View {
    @Binding var isAuthenticated: Bool
    @State private var authError: String?
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "lock.shield")
                .font(.system(size: 60))
                .foregroundColor(.accentColor)
            
            Text("Password Manager")
                .font(.title)
                .fontWeight(.bold)
            
            Text("Unlock using Touch ID")
                .foregroundColor(.secondary)
            
            Button(action: authenticate) {
                Label("Unlock", systemImage: "touchid")
                    .font(.headline)
                    .padding()
                    .frame(maxWidth: 200)
                    .background(Color.accentColor)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
            
            if let error = authError {
                Text(error)
                    .foregroundColor(.red)
                    .font(.caption)
            }
        }
        .padding()
        .onAppear(perform: authenticate)
    }
    
    private func authenticate() {
        let context = LAContext()
        var error: NSError?
        
        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics,
                                 localizedReason: "Unlock Password Manager") { success, error in
                DispatchQueue.main.async {
                    if success {
                        isAuthenticated = true
                        authError = nil
                    } else {
                        authError = error?.localizedDescription
                    }
                }
            }
        } else {
            authError = error?.localizedDescription ?? "Touch ID not available"
        }
    }
}
