/*********************************************************************
 * Copyright (c) Intel Corporation 2023
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing'
import { input } from '@angular/core'

import { KVMComponent } from './kvm.component'
import {
  AMTDesktop,
  AMTRedirector,
  DataProcessor,
  KeyBoardHelper,
  MouseHelper
} from '@open-amt-cloud-toolkit/ui-toolkit/core'

describe('KvmComponent', () => {
  let component: KVMComponent
  let fixture: ComponentFixture<KVMComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KVMComponent]
    }).compileComponents()
  })

  const setup = (): void => {
    fixture = TestBed.createComponent(KVMComponent)
    component = fixture.componentInstance
    // Set initial inputs via setInput
    fixture.componentRef.setInput('mpsServer', '')
    fixture.componentRef.setInput('authToken', '')
    fixture.componentRef.setInput('deviceId', '')
    fixture.detectChanges()
  }

  const asyncSetup = fakeAsync(() => {
    fixture = TestBed.createComponent(KVMComponent)
    component = fixture.componentInstance
    fixture.componentRef.setInput('mpsServer', 'wss://localhost')
    fixture.componentRef.setInput('authToken', 'authToken')
    fixture.componentRef.setInput('deviceId', '')
    tick(4500)
    fixture.detectChanges()
    flush()
  })

  it('should create', () => {
    setup()
    expect(component).toBeTruthy()
    expect(component.redirector).toBeInstanceOf(AMTRedirector)
    expect(component.module).toBeInstanceOf(AMTDesktop)
    expect(component.mouseHelper).toBeInstanceOf(MouseHelper)
    expect(component.keyboardHelper).toBeInstanceOf(KeyBoardHelper)
    expect(component.dataProcessor).toBeInstanceOf(DataProcessor)
    expect(component.selected).toEqual(1)
    expect(component.encodings.length).toEqual(2)
    expect(component.mpsServer()).toBe('')
    expect(component.deviceId()).toBe('')
    expect(component.authToken()).toBe('')
  })

  it('should autoconnect on pageload', () => {
    asyncSetup()
    spyOn<any>(component.redirector, 'start')
    spyOn(component.keyboardHelper, 'GrabKeyInput')
    expect(component.redirector).not.toBeNull()
    expect(component.mpsServer()).toEqual('wss://localhost')
    expect(component.authToken()).toEqual('authToken')
  })

  it('should reset all the objects once kvm is stopped', () => {
    setup()
    spyOn<any>(component.redirector, 'stop')
    spyOn(component.keyboardHelper, 'UnGrabKeyInput')
    const resetSpy = spyOn(component, 'reset')
    component.stopKvm()
    expect(component.redirector?.stop).toHaveBeenCalled()
    expect(component.keyboardHelper.UnGrabKeyInput).toHaveBeenCalled()
    expect(resetSpy).toHaveBeenCalled()
  })

  it('should disconnect the active KVM session if there is an encoding change', fakeAsync(() => {
    setup()
    const stopKvmSpy = spyOn(component, 'stopKvm')
    const autoConnectSpy = spyOn(component, 'autoConnect')
    component.selectedEncoding().emit(1)
    tick(1100)
    fixture.detectChanges()
    expect(component.selected).toEqual(1)
    expect(stopKvmSpy).toHaveBeenCalled()
    expect(autoConnectSpy).toHaveBeenCalled()
    flush()
  }))

  it('should reset and re-instantiate the core objects on error', () => {
    setup()
    const resetSpy = spyOn(component, 'reset')
    component.onRedirectorError()

    expect(resetSpy).toHaveBeenCalled()
  })

  it('should trigger the core components method on mouse interactions', () => {
    setup()
    spyOn(component.mouseHelper, 'mousedown')
    spyOn(component.mouseHelper, 'mouseup')
    spyOn(component.mouseHelper, 'mousemove')

    const event: any = {
      button: 1,
      pageX: 100,
      pageY: 211
    }
    component.onMousedown(event as MouseEvent)
    expect(component.mouseHelper).not.toBeNull()
    expect(component.mouseHelper.mousedown).toHaveBeenCalled()

    component.onMouseup(event as MouseEvent)
    expect(component.mouseHelper).not.toBeNull()
    expect(component.mouseHelper.mouseup).toHaveBeenCalled()

    component.onMousemove(event as MouseEvent)
    expect(component.mouseHelper).not.toBeNull()
    expect(component.mouseHelper.mousemove).toHaveBeenCalled()
  })
})
