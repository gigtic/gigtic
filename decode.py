import struct
import binascii

def decode(wkb_hex):
    b = binascii.unhexlify(wkb_hex)
    # Skip first 9 bytes (endian, type, srid)
    x, y = struct.unpack('<dd', b[9:25])
    return x, y

print("Job:", decode("0101000020E6100000010000430F6D53400AF6803FEA062A40"))
print("Vini:", decode("0101000020E61000000100009D0F6D5340881CC45BEE062A40"))
print("Pawar:", decode("0101000020E61000003C3022660E6D534011F6803FEA062A40"))
