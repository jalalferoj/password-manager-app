import Foundation
import Security

class PasswordStore: ObservableObject {
    @Published private(set) var passwords: [PasswordEntry] = []
    private let keychainService = "com.passwordmanager.passwords"
    
    init() {
        loadPasswords()
    }
    
    func addPassword(_ password: PasswordEntry) {
        passwords.append(password)
        savePasswords()
    }
    
    func deletePasswords(at offsets: IndexSet) {
        passwords.remove(atOffsets: offsets)
        savePasswords()
    }
    
    private func loadPasswords() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        if status == errSecSuccess,
           let data = result as? Data,
           let savedPasswords = try? JSONDecoder().decode([PasswordEntry].self, from: data) {
            passwords = savedPasswords
        }
    }
    
    private func savePasswords() {
        guard let data = try? JSONEncoder().encode(passwords) else { return }
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService
        ]
        
        let attributes: [String: Any] = [
            kSecValueData as String: data
        ]
        
        let status = SecItemUpdate(query as CFDictionary, attributes as CFDictionary)
        
        if status == errSecItemNotFound {
            let query: [String: Any] = [
                kSecClass as String: kSecClassGenericPassword,
                kSecAttrService as String: keychainService,
                kSecValueData as String: data
            ]
            SecItemAdd(query as CFDictionary, nil)
        }
    }
}
