import SwiftUI

struct PasswordRowView: View {
    let password: PasswordEntry
    @State private var showPassword = false
    @State private var showingAlert = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(password.title)
                .font(.headline)
            
            Text(password.username)
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            HStack {
                if showPassword {
                    Text(password.password)
                        .font(.system(.body, design: .monospaced))
                } else {
                    Text(String(repeating: "•", count: 8))
                        .font(.system(.body, design: .monospaced))
                }
                
                Spacer()
                
                Button(action: { showPassword.toggle() }) {
                    Image(systemName: showPassword ? "eye.slash" : "eye")
                        .foregroundColor(.accentColor)
                }
                
                Button(action: copyPassword) {
                    Image(systemName: "doc.on.doc")
                        .foregroundColor(.accentColor)
                }
            }
        }
        .padding(.vertical, 4)
        .alert("Password Copied", isPresented: $showingAlert) {
            Button("OK", role: .cancel) {}
        }
    }
    
    private func copyPassword() {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(password.password, forType: .string)
        showingAlert = true
        
        // Clear password from clipboard after 30 seconds
        DispatchQueue.main.asyncAfter(deadline: .now() + 30) {
            NSPasteboard.general.clearContents()
        }
    }
}
