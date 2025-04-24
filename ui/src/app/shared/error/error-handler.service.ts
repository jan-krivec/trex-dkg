import { Injectable } from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ErrorDialogComponent} from "./error-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(private dialog: MatDialog, private _snackBar: MatSnackBar) { }

  // Method to display error dialog
  displayError(errorMessage: string): MatDialogRef<ErrorDialogComponent> {
    const parsedMessage = this.parseRpcError(errorMessage);
    return this.dialog.open(ErrorDialogComponent, {
      data: { message: parsedMessage }
    });
  }

  showSnackBar(message: string) {
    this._snackBar.open(message, 'X', {
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  private parseRpcError(errorMessage: string): string {
    try {
      if (errorMessage.includes('Internal JSON-RPC error')) {
        const jsonStart = errorMessage.indexOf('{');
        const jsonEnd = errorMessage.lastIndexOf('}') + 1;
        const jsonStr = errorMessage.substring(jsonStart, jsonEnd);
        const parsed = JSON.parse(jsonStr);

        // Try to extract the reason string from the message
        const vmMessage = parsed?.data?.message || parsed?.message || errorMessage;
        const reasonMatch = vmMessage.match(/reverted with reason string ['"](.+?)['"]/);

        if (reasonMatch && reasonMatch[1]) {
          return reasonMatch[1]; // Return just the reason string
        } else {
          return vmMessage; // Return full message if reason string not found
        }
      }

      return errorMessage; // Not a JSON-RPC error
    } catch (e) {
      // Parsing failed, return original error
      return errorMessage;
    }
  }
}
