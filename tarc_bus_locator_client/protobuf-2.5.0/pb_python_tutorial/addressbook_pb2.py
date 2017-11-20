# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: addressbook.proto

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import descriptor_pb2
# @@protoc_insertion_point(imports)




DESCRIPTOR = _descriptor.FileDescriptor(
  name='addressbook.proto',
  package='',
  serialized_pb='\n\x11\x61\x64\x64ressbook.proto\"\xc8\x01\n\x06Person\x12\x0c\n\x04name\x18\x01 \x02(\t\x12\n\n\x02id\x18\x02 \x02(\x05\x12\r\n\x05\x65mail\x18\x03 \x01(\t\x12\"\n\x05phone\x18\x04 \x03(\x0b\x32\x13.Person.PhoneNumber\x1a\x44\n\x0bPhoneNumber\x12\x0e\n\x06number\x18\x01 \x02(\t\x12%\n\x04type\x18\x02 \x01(\x0e\x32\x11.Person.PhoneType:\x04HOME\"+\n\tPhoneType\x12\n\n\x06MOBILE\x10\x00\x12\x08\n\x04HOME\x10\x01\x12\x08\n\x04WORK\x10\x02\"&\n\x0b\x41\x64\x64ressBook\x12\x17\n\x06person\x18\x01 \x03(\x0b\x32\x07.Person')



_PERSON_PHONETYPE = _descriptor.EnumDescriptor(
  name='PhoneType',
  full_name='Person.PhoneType',
  filename=None,
  file=DESCRIPTOR,
  values=[
    _descriptor.EnumValueDescriptor(
      name='MOBILE', index=0, number=0,
      options=None,
      type=None),
    _descriptor.EnumValueDescriptor(
      name='HOME', index=1, number=1,
      options=None,
      type=None),
    _descriptor.EnumValueDescriptor(
      name='WORK', index=2, number=2,
      options=None,
      type=None),
  ],
  containing_type=None,
  options=None,
  serialized_start=179,
  serialized_end=222,
)


_PERSON_PHONENUMBER = _descriptor.Descriptor(
  name='PhoneNumber',
  full_name='Person.PhoneNumber',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='number', full_name='Person.PhoneNumber.number', index=0,
      number=1, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='type', full_name='Person.PhoneNumber.type', index=1,
      number=2, type=14, cpp_type=8, label=1,
      has_default_value=True, default_value=1,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  options=None,
  is_extendable=False,
  extension_ranges=[],
  serialized_start=109,
  serialized_end=177,
)

_PERSON = _descriptor.Descriptor(
  name='Person',
  full_name='Person',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='name', full_name='Person.name', index=0,
      number=1, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='id', full_name='Person.id', index=1,
      number=2, type=5, cpp_type=1, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='email', full_name='Person.email', index=2,
      number=3, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    _descriptor.FieldDescriptor(
      name='phone', full_name='Person.phone', index=3,
      number=4, type=11, cpp_type=10, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
  ],
  extensions=[
  ],
  nested_types=[_PERSON_PHONENUMBER, ],
  enum_types=[
    _PERSON_PHONETYPE,
  ],
  options=None,
  is_extendable=False,
  extension_ranges=[],
  serialized_start=22,
  serialized_end=222,
)


_ADDRESSBOOK = _descriptor.Descriptor(
  name='AddressBook',
  full_name='AddressBook',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='person', full_name='AddressBook.person', index=0,
      number=1, type=11, cpp_type=10, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  options=None,
  is_extendable=False,
  extension_ranges=[],
  serialized_start=224,
  serialized_end=262,
)

_PERSON_PHONENUMBER.fields_by_name['type'].enum_type = _PERSON_PHONETYPE
_PERSON_PHONENUMBER.containing_type = _PERSON;
_PERSON.fields_by_name['phone'].message_type = _PERSON_PHONENUMBER
_PERSON_PHONETYPE.containing_type = _PERSON;
_ADDRESSBOOK.fields_by_name['person'].message_type = _PERSON
DESCRIPTOR.message_types_by_name['Person'] = _PERSON
DESCRIPTOR.message_types_by_name['AddressBook'] = _ADDRESSBOOK

class Person(_message.Message):
  __metaclass__ = _reflection.GeneratedProtocolMessageType

  class PhoneNumber(_message.Message):
    __metaclass__ = _reflection.GeneratedProtocolMessageType
    DESCRIPTOR = _PERSON_PHONENUMBER

    # @@protoc_insertion_point(class_scope:Person.PhoneNumber)
  DESCRIPTOR = _PERSON

  # @@protoc_insertion_point(class_scope:Person)

class AddressBook(_message.Message):
  __metaclass__ = _reflection.GeneratedProtocolMessageType
  DESCRIPTOR = _ADDRESSBOOK

  # @@protoc_insertion_point(class_scope:AddressBook)


# @@protoc_insertion_point(module_scope)