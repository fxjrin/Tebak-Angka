import LLM "mo:llm";
import Nat "mo:base/Nat";

persistent actor {
  stable var answer : Nat = 0;

  // Meminta LLM memilih angka random 1-100
  public func generateAnswer() : async Nat {
    let promptText = "Pilih satu angka random antara 1 sampai 100. Jawab hanya dengan angkanya saja.";
    let response = await LLM.prompt(#Llama3_1_8B, promptText);
    // Parsing hasil LLM ke Nat
    let parsed = Nat.fromText(response);
    switch (parsed) {
      case (?n) {
        answer := n;
        n;
      };
      case null 0;
    }
  };

  // User menebak angka
  public func guess(n : Nat) : async Text {
    if (n == answer) {
      "Benar! Kamu menebak angka yang tepat."
    } else if (n < answer) {
      "Terlalu kecil."
    } else {
      "Terlalu besar."
    }
  };
}