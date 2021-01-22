import { Component, OnInit } from '@angular/core';
import {CalculatorService} from "./calculator.service";

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent implements OnInit {

  subText = '';
  mainText = '';
  operand1: number;
  operand2: number;
  operator = '';
  calculationString = '';
  answered = false;
  operatorSet = false;
  calculations = new Queue<string>();
  reversedCalculations: string[] = [];

  constructor(private calculatorService: CalculatorService) {}

  ngOnInit(): void
  {
    //on reload of the page, get the previously saved calculations from local storage
    if(localStorage['previousCalculations'] != undefined){
      let output: Queue<string> = JSON.parse(localStorage['previousCalculations']);
      this.calculations.storage = output.storage;
      this.reversedCalculations = output.storage.slice().reverse();
    }
    //This will detect a change in another window
    if (window.addEventListener) {
      window.addEventListener("storage", this._listener, false);
    }
    //detects a change in local storage on the same window/tab
    this.calculatorService.watchStorage().subscribe(data =>{
      this.reloadPage();
    });
  }

  //method called when a change is made on another window/tab
  private _listener = () => {
    this.reloadPage();
  }

  pressKey(key: string) {
    if (key === '/' || key === 'x' || key === '-' || key === '+') {
      const lastKey = this.mainText[this.mainText.length - 1];
      if (lastKey === '/' || lastKey === 'x' || lastKey === '-' || lastKey === '+')  {
        this.operatorSet = true;
      }
      if ((this.operatorSet) || (this.mainText === '')) {
        return;
      }
      this.operand1 = parseFloat(this.mainText);
      this.operator = key;
      this.operatorSet = true;
    }
    if (this.mainText.length === 10) {
      return;
    }
    this.mainText += key;
  }

  allClear() {
    this.mainText = '';
    this.subText = '';
    this.operatorSet = false;
  }

  getAnswer() {
    this.calculationString = this.mainText;
    this.operand2 = parseFloat(this.mainText.split(this.operator)[1]);
    if (this.operator === '/') {
      this.subText = this.mainText;
      this.mainText = (this.operand1 / this.operand2).toString();
      this.subText = this.calculationString;
      if (this.mainText.length > 9) {
        this.mainText = this.mainText.substr(0, 9);
      }
    } else if (this.operator === 'x') {
      this.subText = this.mainText;
      this.mainText = (this.operand1 * this.operand2).toString();
      this.subText = this.calculationString;
      if (this.mainText.length > 9) {
        this.mainText = 'ERROR';
        this.subText = 'Range Exceeded';
      }
    } else if (this.operator === '-') {
      this.subText = this.mainText;
      this.mainText = (this.operand1 - this.operand2).toString();
      this.subText = this.calculationString;
    } else if (this.operator === '+') {
      this.subText = this.mainText;
      this.mainText = (this.operand1 + this.operand2).toString();
      this.subText = this.calculationString;
      if (this.mainText.length > 9) {
        this.mainText = 'ERROR';
        this.subText = 'Range Exceeded';
      }
    } else {
      this.subText = 'ERROR: Invalid Operation';
    }
    this.answered = true;
    this.saveCalculations(this.subText, this.mainText);
  }

  saveCalculations(subText, mainText)
  {
    let calculatedString = subText + " = " + mainText;
    if(this.calculations.size() == 10){
      this.calculations.dequeue();
    }
    this.calculations.enqueue(calculatedString);
    this.calculatorService.setItem('previousCalculations', JSON.stringify(this.calculations));
    // localStorage['previousCalculations'] = JSON.stringify(this.calculations);
    this.reloadPage();
  }

  reloadPage() {
    window.location.reload();
  }

  ngOnDestroy(){
    window.removeEventListener("storage", this._listener, false);
  }

}

interface IQueue<T> {
  enqueue(item: T): void;
  dequeue(): T;
  size(): number;
}

class Queue<T> implements IQueue<T> {
  public storage: T[] = [];

  constructor(private capacity: number = 10) {}

  enqueue(item: T): void {
    if (this.size() === this.capacity) {
      throw Error("Queue has reached max capacity, you cannot add more items");
    }
    this.storage.push(item);
  }
  dequeue(): T | undefined {
    return this.storage.shift();
  }
  size(): number {
    return this.storage.length;
  }
}
