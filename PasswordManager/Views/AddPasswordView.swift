import SwiftUI

struct AddPasswordView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var passwordStore: PasswordStore
    
    @State private var title = ""
    @State private var username = ""
    @State private var password = ""
    @State private var showPassword = false
    
    var body: some View {
        NavigationView {
            Form {
                Section {
                    TextField("Title", text: $title)
                    TextField("Username", text: $username)
                    
                    HStack {
                        if showPassword {
                            TextField("Password", text: $password)
                        } else {
                            SecureField("Password", text: $password)
                        }
                        
                        Button(action: { showPassword.toggle() }) {
                            Image(systemName: showPassword ? "eye.slash" : "eye")
                                .foregroundColor(.accentColor)
                        }
                    }
                }
                
                Section {
                    Button(action: generatePassword) {
                        Label("Generate Strong Password", systemImage: "key")
                    }
                }
            }
            .navigationTitle("Add Password")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        savePassword()
                    }
                    .disabled(title.isEmpty || username.isEmpty || password.isEmpty)
                }
            }
        }
    }
    
    private func generatePassword() {
        let length = 16
        let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
        password = String((0..<length).map { _ in characters.randomElement()! })
    }
    
    private func savePassword() {
        let entry = PasswordEntry(title: title, username: username, password: password)
        passwordStore.addPassword(entry)
        dismiss()
    }
}
