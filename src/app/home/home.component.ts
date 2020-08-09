import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { AdalService } from 'adal-angular4';
import {HttpClient, HttpErrorResponse, HttpEventType} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Observable, of} from 'rxjs';
import {HomeService} from './home.service';
import {catchError, map} from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  user: any;
  profile: any;

  displayedColumns: string[] = ['id', 'description'];
  isLoading = true;
  @ViewChild('fileUpload') fileUpload: ElementRef;
  files  = [];
  constructor(private adalService: AdalService, protected http: HttpClient, public snackBar: MatSnackBar, protected homeService: HomeService) { }

  dataSource = [
    {id: 1, description: 'No data'}
  ];
  ngOnInit() {
    try {
      this.isLoading = true;
      this.user = this.adalService.userInfo;

      this.user.token = this.user.token.substring(0, 10) + '...';
      this.getInfo().subscribe({
        next: result => {
          if (result['data']) {
            this.snackBar.open('Success', result['data']['source'], {
              duration: 10000
            });
            this.dataSource = result['data']['values'];
          } else {
            this.snackBar.open('Server Error', 'Error', {
              duration: 10000
            });
          }
          this.isLoading = false;
        }
      });
    } catch (e) {
      this.isLoading = false;
      console.log(e);
    }
  }

  public getProfile() {
    console.log('Get Profile called');
    return this.http.get('https://graph.microsoft.com/v1.0/me');
  }
  getInfo() {
    this.isLoading = true;
    return this.http.get('https://se-redis-api.azurewebsites.net/information/get');
  }
  public profileClicked() {
    this.getProfile().subscribe({
      next: result => {
        console.log('Profile Response Received');
        this.profile = result;
      }
    });
  }
  uploadFile(file) {
    const formData = new FormData();
    formData.append('image', file.data);
    this.isLoading = true;
    this.homeService.upload(formData).subscribe({
      next: result => {
        if (result['statusCode'] === 200) {
          this.snackBar.open('Success', 'Upload', {
            duration: 10000
          });
        } else {
          this.snackBar.open('Server Error', 'Error', {
            duration: 10000
          });
        }
        this.isLoading = false;
      }
    });
  }
  private uploadFiles() {
    this.fileUpload.nativeElement.value = '';
    this.uploadFile(this.files[0]);
  }
  onClick() {
    const fileUpload = this.fileUpload.nativeElement;
    fileUpload.onchange = () => {
      for (let index = 0; index < fileUpload.files.length; index++) {
        const file = fileUpload.files[index];
        this.files.push({data: file, inProgress: false, progress: 0});
      }
      this.uploadFiles();
    };
    fileUpload.click();
  }
}
